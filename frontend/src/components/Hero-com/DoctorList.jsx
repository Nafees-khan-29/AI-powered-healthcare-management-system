export const doctorsData = {
  Cardiology: [
    {
      name: 'Dr. Sarah Mitchell',
      specialization: 'Cardiology',
      image: '/images/doc1.jpg',
      experience: '8+ years',
      availability: 'Mon - Fri',
      education: 'MD - Cardiology',
      phone: '+1-555-0101',
      email: 'sarah.mitchell@healthcare.com',
      hospital: 'Mount Sinai Hospital'
    }
  ],
  Neurology: [
    {
      name: 'Dr. Michael Chen',
      specialization: 'Neurology',
      image: '/images/doc2.jpg',
      experience: '10+ years',
      availability: 'Mon - Fri',
      education: 'MD - Neurology',
      phone: '+1-555-0102',
      email: 'michael.chen@healthcare.com',
      hospital: 'Massachusetts General Hospital'
    }
  ],
  Pediatrics: [
    {
      name: 'Dr. Emily Rodriguez',
      specialization: 'Pediatrics',
      image: '/images/doc3.jpg',
      experience: '6+ years',
      availability: 'Mon - Sat',
      education: 'MD - Pediatrics',
      phone: '+1-555-0103',
      email: 'emily.rodriguez@healthcare.com',
      hospital: 'Children\'s Hospital Los Angeles'
    }
  ],
  Orthopedics: [
    {
      name: 'Dr. James Anderson',
      specialization: 'Orthopedics',
      image: '/images/doc4.jpg',
      experience: '12+ years',
      availability: 'Mon - Fri',
      education: 'MD - Orthopedics',
      phone: '+1-555-0104',
      email: 'james.anderson@healthcare.com',
      hospital: 'Northwestern Memorial Hospital'
    }
  ],
  Dermatology: [
    {
      name: 'Dr. Priya Patel',
      specialization: 'Dermatology',
      image: '/images/doc5.jpg',
      experience: '5+ years',
      availability: 'Tue - Sat',
      education: 'MD - Dermatology',
      phone: '+1-555-0105',
      email: 'priya.patel@healthcare.com',
      hospital: 'Houston Methodist Hospital'
    }
  ],
  Oncology: [
    {
      name: 'Dr. Robert Williams',
      specialization: 'Oncology',
      image: '/images/doc6.jpg',
      experience: '14+ years',
      availability: 'Mon - Fri',
      education: 'MD - Oncology',
      phone: '+1-555-0106',
      email: 'robert.williams@healthcare.com',
      hospital: 'Penn Medicine'
    }
  ],
  Gynecology: [
    {
      name: 'Dr. Lisa Thompson',
      specialization: 'Gynecology',
      image: '/images/doc7.jpg',
      experience: '9+ years',
      availability: 'Mon - Sat',
      education: 'MD - Gynecology',
      phone: '+1-555-0107',
      email: 'lisa.thompson@healthcare.com',
      hospital: 'Mayo Clinic Arizona'
    }
  ],
  Psychiatry: [
    {
      name: 'Dr. David Kim',
      specialization: 'Psychiatry',
      image: '/images/doc8.jpg',
      experience: '7+ years',
      availability: 'Tue - Sat',
      education: 'MD - Psychiatry',
      phone: '+1-555-0108',
      email: 'david.kim@healthcare.com',
      hospital: 'UCSF Medical Center'
    }
  ],
  Endocrinology: [
    {
      name: 'Dr. Maria Garcia',
      specialization: 'Endocrinology',
      image: '/images/doc9.jpg',
      experience: '11+ years',
      availability: 'Mon - Fri',
      education: 'MD - Endocrinology',
      phone: '+1-555-0109',
      email: 'maria.garcia@healthcare.com',
      hospital: 'Jackson Memorial Hospital'
    }
  ],
  Gastroenterology: [
    {
      name: 'Dr. Thomas Brown',
      specialization: 'Gastroenterology',
      image: '/images/doc10.jpg',
      experience: '13+ years',
      availability: 'Mon - Fri',
      education: 'MD - Gastroenterology',
      phone: '+1-555-0110',
      email: 'thomas.brown@healthcare.com',
      hospital: 'Seattle Children\'s Hospital'
    }
  ],
  Ophthalmology: [
    {
      name: 'Dr. Jennifer Lee',
      specialization: 'Ophthalmology',
      image: '/images/doc11.jpg',
      experience: '4+ years',
      availability: 'Tue - Sat',
      education: 'MD - Ophthalmology',
      phone: '+1-555-0111',
      email: 'jennifer.lee@healthcare.com',
      hospital: 'Denver Health Medical Center'
    }
  ],
  Pulmonology: [
    {
      name: 'Dr. Ahmed Hassan',
      specialization: 'Pulmonology',
      image: '/images/doc12.jpg',
      experience: '10+ years',
      availability: 'Mon - Fri',
      education: 'MD - Pulmonology',
      phone: '+1-555-0112',
      email: 'ahmed.hassan@healthcare.com',
      hospital: 'Emory University Hospital'
    }
  ],
  Rheumatology: [
    {
      name: 'Dr. Rachel Cohen',
      specialization: 'Rheumatology',
      image: '/images/doc13.jpg',
      experience: '6+ years',
      availability: 'Wed - Sun',
      education: 'MD - Rheumatology',
      phone: '+1-555-0113',
      email: 'rachel.cohen@healthcare.com',
      hospital: 'Johns Hopkins Hospital'
    }
  ],
  Urology: [
    {
      name: 'Dr. Kevin O\'Brien',
      specialization: 'Urology',
      image: '/images/doc14.jpg',
      experience: '12+ years',
      availability: 'Mon - Fri',
      education: 'MD - Urology',
      phone: '+1-555-0114',
      email: 'kevin.obrien@healthcare.com',
      hospital: 'Oregon Health & Science University'
    }
  ],
  Radiology: [
    {
      name: 'Dr. Aisha Mohammed',
      specialization: 'Radiology',
      image: '/images/doc15.jpg',
      experience: '3+ years',
      availability: 'Tue - Sat',
      education: 'MD - Radiology',
      phone: '+1-555-0115',
      email: 'aisha.mohammed@healthcare.com',
      hospital: 'Henry Ford Hospital'
    }
  ]
};

export const categories = Object.keys(doctorsData);

export const getAllDoctors = () => {
  return Object.values(doctorsData).flat();
};