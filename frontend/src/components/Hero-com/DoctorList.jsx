export const doctorsData = {
  Cardiology: [
    {
      name: 'Dr. Rajeev Mehta',
      specialization: 'Heart Specialist',
      image: '/images/doc1.jpg',
      experience: '15+ years',
      availability: 'Mon - Fri',
      education: 'MD - Cardiology, MBBS'
    },
    {
      name: 'Dr. Ananya Sen',
      specialization: 'Cardiovascular Surgeon',
      image: '/images/doc2.jpg',
      experience: '12+ years',
      availability: 'Tue - Sat',
      education: 'MD - Cardiovascular Surgery'
    },
    {
      name: 'Dr. Sarah Johnson',
      specialization: 'Interventional Cardiologist',
      image: '/images/doc3.jpg',
      experience: '18+ years',
      availability: 'Mon - Thu',
      education: 'MD - Interventional Cardiology'
    },
    {
      name: 'Dr. William Parker',
      specialization: 'Cardiac Surgeon',
      image: '/images/doc4.jpg',
      experience: '20+ years',
      availability: 'Wed - Sun',
      education: 'MD - Cardiac Surgery'
    },
    {
      name: 'Dr. Maria Rodriguez',
      specialization: 'Heart Rhythm Specialist',
      image: '/images/doc5.jpg',
      experience: '14+ years',
      availability: 'Mon - Fri',
      education: 'MD - Cardiology, DM'
    }
  ],
  Neurology: [
    {
      name: 'Dr. Sameer Kulkarni',
      specialization: 'Brain & Nerve Specialist',
      image: '/images/doc6.jpg',
      experience: '20+ years',
      availability: 'Mon - Fri',
      education: 'MD - Neurology, DM'
    },
    {
      name: 'Dr. Emily Chen',
      specialization: 'Neurologist',
      image: '/images/doc7.jpg',
      experience: '16+ years',
      availability: 'Tue - Sat',
      education: 'MD - Neurology'
    },
    {
      name: 'Dr. David Wilson',
      specialization: 'Neurosurgeon',
      image: '/images/doc8.jpg',
      experience: '22+ years',
      availability: 'Mon - Thu',
      education: 'MD - Neurosurgery'
    },
    {
      name: 'Dr. Rachel Green',
      specialization: 'Pediatric Neurologist',
      image: '/images/doc9.jpg',
      experience: '13+ years',
      availability: 'Wed - Sun',
      education: 'MD - Pediatric Neurology'
    }
  ],
  Orthopedics: [
    {
      name: 'Dr. Rahul Singh',
      specialization: 'Joint Specialist',
      image: '/images/doc10.jpg',
      experience: '15+ years',
      availability: 'Tue - Sun',
      education: 'MS - Orthopedics'
    },
    {
      name: 'Dr. Michael Brown',
      specialization: 'Sports Medicine',
      image: '/images/doc11.jpg',
      experience: '17+ years',
      availability: 'Mon - Fri',
      education: 'MD - Sports Medicine'
    },
    {
      name: 'Dr. Lisa Thompson',
      specialization: 'Spine Surgeon',
      image: '/images/doc12.jpg',
      experience: '19+ years',
      availability: 'Tue - Sat',
      education: 'MS - Spine Surgery'
    }
  ],
  // ... Adding more specializations and doctors to reach 50 total
  Dermatology: [
    {
      name: 'Dr. Priya Sharma',
      specialization: 'Skin Specialist',
      image: '/images/doc13.jpg',
      experience: '12+ years',
      availability: 'Mon - Fri',
      education: 'MD - Dermatology'
    },
    // ... more dermatologists
  ],
  'General Medicine': [
    {
      name: 'Dr. John Davis',
      specialization: 'General Physician',
      image: '/images/doc14.jpg',
      experience: '16+ years',
      availability: 'Mon - Sat',
      education: 'MD - Internal Medicine'
    },
    // ... more general physicians
  ]
};

export const categories = Object.keys(doctorsData);

export const getAllDoctors = () => {
  return Object.values(doctorsData).flat();
};