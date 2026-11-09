const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

// Ensure data folder and file exist
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

let dbCache = {
  users: [],
  requests: [],
  volunteeroffers: [],
  notifications: [],
  reports: []
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Error loading DB file, initializing empty:', err.message);
    saveDB();
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB file:', err.message);
  }
}

loadDB();

function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

function matchesFilter(item, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatched = val.some(subFilter => matchesFilter(item, subFilter));
      if (!orMatched) return false;
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(itemVal || '')) return false;
      }
      if (val.$ne !== undefined) {
        const itemStr = itemVal ? itemVal.toString() : '';
        const neStr = val.$ne ? val.$ne.toString() : '';
        if (itemStr === neStr) return false;
      }
      if (val.$in && Array.isArray(val.$in)) {
        const itemStr = itemVal ? itemVal.toString() : '';
        const inMatch = val.$in.some(v => (v ? v.toString() : '') === itemStr);
        if (!inMatch) return false;
      }
      continue;
    }

    const itemStr = itemVal ? itemVal.toString() : '';
    const valStr = val ? val.toString() : '';
    if (itemStr !== valStr) return false;
  }
  return true;
}

class Document {
  constructor(collectionName, data) {
    this._collection = collectionName;
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    } else {
      this._id = this._id.toString();
    }
    if (!this.createdAt) this.createdAt = new Date().toISOString();
    if (!this.updatedAt) this.updatedAt = new Date().toISOString();
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    const list = dbCache[this._collection];
    const index = list.findIndex(item => item._id.toString() === this._id.toString());
    const docData = { ...this };
    delete docData._collection;
    if (index >= 0) {
      list[index] = docData;
    } else {
      list.push(docData);
    }
    saveDB();
    return this;
  }

  toObject() {
    const copy = { ...this };
    delete copy._collection;
    return copy;
  }

  toJSON() {
    return this.toObject();
  }
}

class Query {
  constructor(collectionName, filter, isFindOne = false) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.isFindOne = isFindOne;
    this.sortCriteria = null;
    this.limitCount = null;
    this.populateFields = [];
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  populate(field, select) {
    this.populateFields.push({ field, select });
    return this;
  }

  async exec() {
    loadDB();
    let items = (dbCache[this.collectionName] || []).filter(item => matchesFilter(item, this.filter));

    if (this.sortCriteria) {
      items.sort((a, b) => {
        for (const [key, direction] of Object.entries(this.sortCriteria)) {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return direction === -1 || direction === 'desc' ? 1 : -1;
          if (valA > valB) return direction === -1 || direction === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    if (this.limitCount) {
      items = items.slice(0, this.limitCount);
    }

    const wrapDoc = (data) => {
      const doc = new Document(this.collectionName, data);
      for (const pop of this.populateFields) {
        const refId = doc[pop.field];
        if (refId) {
          const targetId = refId.toString();
          // Find in users or requests
          let target = dbCache.users.find(u => u._id.toString() === targetId);
          if (!target) target = dbCache.requests.find(r => r._id.toString() === targetId);
          if (target) {
            const targetCopy = { ...target };
            if (pop.select) {
              const allowed = pop.select.split(' ').map(s => s.trim()).filter(Boolean);
              const sanitized = { _id: targetCopy._id };
              allowed.forEach(k => {
                if (!k.startsWith('-')) sanitized[k] = targetCopy[k];
              });
              doc[pop.field] = sanitized;
            } else {
              delete targetCopy.passwordHash;
              doc[pop.field] = targetCopy;
            }
          }
        }
      }
      return doc;
    };

    if (this.isFindOne) {
      return items.length > 0 ? wrapDoc(items[0]) : null;
    }

    return items.map(wrapDoc);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function createModel(collectionName) {
  return {
    find(filter = {}) {
      return new Query(collectionName, filter, false);
    },
    findOne(filter = {}) {
      return new Query(collectionName, filter, true);
    },
    findById(id) {
      const strId = id ? id.toString() : '';
      return new Query(collectionName, { _id: strId }, true);
    },
    async create(data) {
      loadDB();
      const doc = new Document(collectionName, data);
      const docData = doc.toObject();
      dbCache[collectionName].push(docData);
      saveDB();
      return doc;
    },
    async findByIdAndUpdate(id, update, options = {}) {
      loadDB();
      const strId = id ? id.toString() : '';
      const list = dbCache[collectionName];
      const index = list.findIndex(item => item._id.toString() === strId);
      if (index === -1) return null;

      const current = list[index];
      const actualUpdate = update.$set ? { ...update.$set } : { ...update };
      const updated = {
        ...current,
        ...actualUpdate,
        updatedAt: new Date().toISOString()
      };
      list[index] = updated;
      saveDB();
      return new Document(collectionName, updated);
    },
    async findByIdAndDelete(id) {
      loadDB();
      const strId = id ? id.toString() : '';
      const list = dbCache[collectionName];
      const index = list.findIndex(item => item._id.toString() === strId);
      if (index === -1) return null;
      const removed = list.splice(index, 1)[0];
      saveDB();
      return new Document(collectionName, removed);
    },
    async countDocuments(filter = {}) {
      loadDB();
      return (dbCache[collectionName] || []).filter(item => matchesFilter(item, filter)).length;
    },
    async deleteMany(filter = {}) {
      loadDB();
      const before = dbCache[collectionName].length;
      dbCache[collectionName] = dbCache[collectionName].filter(item => !matchesFilter(item, filter));
      saveDB();
      return { deletedCount: before - dbCache[collectionName].length };
    }
  };
}

module.exports = {
  User: createModel('users'),
  Request: createModel('requests'),
  VolunteerOffer: createModel('volunteeroffers'),
  Notification: createModel('notifications'),
  Report: createModel('reports'),
  saveDB,
  loadDB,
  rawCache: dbCache
};

