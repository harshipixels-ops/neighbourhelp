const bcrypt = require('bcryptjs');
const { getModels } = require('../config/db');

async function seedInitialData() {
  const { User, Request, VolunteerOffer, Notification, Report } = getModels();

  try {
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      console.log('[Seed] Database already contains records. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial NeighbourHelp demo data...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);

    // 1. Create Users
    const admin = await User.create({
      name: 'Community Admin',
      email: 'admin@neighbourhelp.org',
      passwordHash: adminPasswordHash,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      neighbourhood: 'Greenwood Heights',
      bio: 'Platform moderator dedicated to keeping our neighbourhood assistance network safe, welcoming, and responsive.',
      role: 'admin',
      status: 'active'
    });

    const sarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      neighbourhood: 'Maplewood District',
      bio: 'Mom of two, passionate about community gardening and supporting local families.',
      role: 'user',
      status: 'active'
    });

    const marcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      neighbourhood: 'Maplewood District',
      bio: 'Environmental science university student. Happy to lift heavy items, run errands, or help with garden work on weekends.',
      role: 'user',
      status: 'active'
    });

    const eleanor = await User.create({
      name: 'Eleanor Rigby',
      email: 'eleanor@example.com',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=200&q=80',
      neighbourhood: 'Oak Ridge Park',
      bio: 'Retired high school literature teacher. Love reading and sunny afternoons. Need occasional assistance with bulky grocery runs.',
      role: 'user',
      status: 'active'
    });

    const david = await User.create({
      name: 'David Chen',
      email: 'david@example.com',
      passwordHash,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      neighbourhood: 'Sunnyvale Gardens',
      bio: 'Tech enthusiast and weekend volunteer. Always ready to assist seniors and fix household tech setups.',
      role: 'user',
      status: 'active'
    });

    // 2. Create Requests
    const req1 = await Request.create({
      requesterId: eleanor._id,
      title: 'Weekly grocery & essential pantry items pick-up',
      description: 'Need assistance picking up pre-ordered grocery bags from Maple Foods market and bringing them into my ground-floor kitchen.',
      category: 'Grocery and Essentials',
      neighbourhood: 'Oak Ridge Park',
      preferredDate: 'Saturday morning around 10:00 AM',
      additionalInstructions: 'Call upon arrival at gate 3. Order is prepaid under Eleanor #408.',
      status: 'open',
      acceptedVolunteerId: null
    });

    const req2 = await Request.create({
      requesterId: sarah._id,
      title: 'Help moving heavy sofa up to 2nd floor living room',
      description: 'We had a three-seater sofa delivered to our garage. Looking for a kind neighbour with good lifting strength to help me carry it up one flight of stairs.',
      category: 'Carrying and Moving',
      neighbourhood: 'Maplewood District',
      preferredDate: 'Sunday between 2:00 PM and 4:00 PM',
      additionalInstructions: 'Back door through garden path is wide open. Gloves provided.',
      status: 'pending',
      acceptedVolunteerId: null
    });

    const req3 = await Request.create({
      requesterId: david._id,
      title: 'Clearing broken storm branches from elderly neighbour\'s yard',
      description: 'After the high winds last night, several large tree branches fell across Mrs. Higgins’ driveway. Need 1-2 volunteers to help chop and stack them neatly.',
      category: 'Household Assistance',
      neighbourhood: 'Sunnyvale Gardens',
      preferredDate: 'This Friday afternoon',
      additionalInstructions: 'Rakes and garden bags are ready in the shed.',
      status: 'open',
      acceptedVolunteerId: null
    });

    const req4 = await Request.create({
      requesterId: eleanor._id,
      title: 'Garden patio watering and companionship walk',
      description: 'Looking for a friendly neighbour for a gentle 20-minute walk around Oak Ridge Park and help with re-potting some patio ferns.',
      category: 'Elderly Assistance',
      neighbourhood: 'Oak Ridge Park',
      preferredDate: 'Thursday at 11:00 AM',
      additionalInstructions: 'Front bell is disabled, please ring garden chime.',
      status: 'accepted',
      acceptedVolunteerId: david._id
    });

    const req5 = await Request.create({
      requesterId: sarah._id,
      title: 'Pickup library book reservations and postage drop',
      description: 'Need someone passing by the Central Public Library to pick up my reserved children\'s books and drop two return parcels at the post office kiosk.',
      category: 'Errands and Deliveries',
      neighbourhood: 'Maplewood District',
      preferredDate: 'Wednesday by 5:00 PM',
      additionalInstructions: 'Library card barcode will be texted to your mobile.',
      status: 'in_progress',
      acceptedVolunteerId: marcus._id
    });

    const req6 = await Request.create({
      requesterId: eleanor._id,
      title: 'Setup smart TV and connect Wi-Fi router for video calls',
      description: 'My children gifted me a new tablet and smart TV to stay in touch, but I need guidance getting the Wi-Fi settings configured.',
      category: 'Other Everyday Assistance',
      neighbourhood: 'Oak Ridge Park',
      preferredDate: 'Last weekend',
      additionalInstructions: 'Tea and homemade lemon biscuits provided!',
      status: 'completed',
      acceptedVolunteerId: david._id
    });

    // 3. Create Volunteer Offers
    // Marcus volunteered for Sarah's moving request
    const offer1 = await VolunteerOffer.create({
      requestId: req2._id,
      volunteerId: marcus._id,
      message: 'Hi Sarah! I live just two streets over on Elmwood. I have a trolley dolly and can easily help carry the sofa on Sunday at 2 PM!',
      status: 'pending'
    });

    // David accepted for Eleanor's garden request
    const offer2 = await VolunteerOffer.create({
      requestId: req4._id,
      volunteerId: david._id,
      message: 'Hello Eleanor, I would be delighted to join for the walk and assist with your lovely ferns.',
      status: 'accepted'
    });

    // Marcus in-progress for Sarah's library books
    const offer3 = await VolunteerOffer.create({
      requestId: req5._id,
      volunteerId: marcus._id,
      message: 'I ride my bike past the library every Wednesday around 3:30 PM. Would be glad to take care of this for you!',
      status: 'accepted'
    });

    // David completed for Eleanor's TV setup
    const offer4 = await VolunteerOffer.create({
      requestId: req6._id,
      volunteerId: david._id,
      message: 'Happy to drop by and set up the connections and test video calling with your family.',
      status: 'accepted'
    });

    // 4. Create Notifications
    await Notification.create({
      recipientId: sarah._id,
      type: 'offer_received',
      message: 'Marcus Vance submitted a volunteer offer for "Help moving heavy sofa up to 2nd floor living room".',
      relatedRequestId: req2._id,
      isRead: false
    });

    await Notification.create({
      recipientId: marcus._id,
      type: 'offer_accepted',
      message: 'Sarah Jenkins accepted your volunteer offer for "Pickup library book reservations and postage drop"!',
      relatedRequestId: req5._id,
      isRead: true
    });

    await Notification.create({
      recipientId: eleanor._id,
      type: 'request_completed',
      message: 'Your request "Setup smart TV and connect Wi-Fi router for video calls" was marked as completed.',
      relatedRequestId: req6._id,
      isRead: true
    });

    // 5. Create a sample report for moderation testing
    await Report.create({
      reporterId: david._id,
      targetType: 'request',
      targetId: req3._id.toString(),
      reason: 'Safety Verification',
      details: 'Confirming that chain saws will not be operated by untrained individuals; request owner noted simple hand saws only.',
      status: 'pending'
    });

    console.log('[Seed] Database successfully seeded with demo users, requests, and offers!');
    console.log('[Seed] Demo Credentials:');
    console.log('       Admin:     admin@neighbourhelp.org / admin123');
    console.log('       Requester: sarah@example.com / password123');
    console.log('       Volunteer: marcus@example.com / password123');
    console.log('       Senior:    eleanor@example.com / password123');
    console.log('       Helper:    david@example.com / password123');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
}

module.exports = { seedInitialData };

