import appointment_img from './appointment_img.png'
import header_img from './header_img.png'
import group_profiles from './group_profiles.png'
import profile_pic from './profile_pic.png'
import contact_image from './contact_image.png'
import about_image from './about_image.png'
import logo from './logo.svg'
import dropdown_icon from './dropdown_icon.svg'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import chats_icon from './chats_icon.svg'
import verified_icon from './verified_icon.svg'
import arrow_icon from './arrow_icon.svg'
import info_icon from './info_icon.svg'
import upload_icon from './upload_icon.png'
import stripe_logo from './stripe_logo.png'
import razorpay_logo from './razorpay_logo.png'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import doc16 from './doc16.jpg'
import doc17 from './doc17.jpg'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'


export const assets = {
    appointment_img,
    header_img,
    group_profiles,
    logo,
    chats_icon,
    verified_icon,
    info_icon,
    profile_pic,
    arrow_icon,
    contact_image,
    about_image,
    menu_icon,
    cross_icon,
    dropdown_icon,
    upload_icon,
    stripe_logo,
    razorpay_logo
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]

export const doctors = [
    {
        _id: '674d1a2b3c4d5e6f7a8b9c0d',
        name: 'Dr. Sarah Mitchell',
        image: doc9,
        speciality: 'Cardiology',
        degree: 'MD',
        experience: '7 Years',
        about: 'Dr. Sarah Mitchell is a highly skilled cardiologist with expertise in preventive cardiology and heart disease management. She is dedicated to providing compassionate care and using the latest medical advances to improve patient outcomes.',
        fees: 150,
        email: 'sarah.mitchell@healthcare.com',
        phone: '+1-555-0101',
        hospital: 'Mount Sinai Hospital',
        licenseNumber: 'MD-2018-45678',
        address: {
            line1: '123 Medical Plaza, Suite 400',
            line2: 'New York, NY 10001'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c0e',
        name: 'Dr. Michael Chen',
        image: doc1,
        speciality: 'Neurology',
        degree: 'MD',
        experience: '8 Years',
        about: 'Dr. Michael Chen specializes in neurological disorders with a focus on stroke prevention and treatment. His commitment to patient care and research has made him a leader in his field.',
        fees: 160,
        email: 'michael.chen@healthcare.com',
        phone: '+1-555-0102',
        hospital: 'Massachusetts General Hospital',
        licenseNumber: 'MD-2017-34567',
        address: {
            line1: '456 Brain Center Dr',
            line2: 'Boston, MA 02115'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c0f',
        name: 'Dr. Emily Rodriguez',
        image: doc13,
        speciality: 'Pediatrics',
        degree: 'MD',
        experience: '6 Years',
        about: 'Dr. Emily Rodriguez is passionate about children\'s health and development. She provides comprehensive pediatric care with a gentle approach that puts young patients and their families at ease.',
        fees: 120,
        email: 'emily.rodriguez@healthcare.com',
        phone: '+1-555-0103',
        hospital: 'Children\'s Hospital Los Angeles',
        licenseNumber: 'MD-2019-56789',
        address: {
            line1: '789 Children\'s Way',
            line2: 'Los Angeles, CA 90001'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c10',
        name: 'Dr. James Anderson',
        image: doc4,
        speciality: 'Orthopedics',
        degree: 'MD',
        experience: '9 Years',
        about: 'Dr. James Anderson is an expert in orthopedic surgery with specialization in sports medicine and joint replacement. He uses advanced surgical techniques to help patients regain mobility and quality of life.',
        fees: 180,
        email: 'james.anderson@healthcare.com',
        phone: '+1-555-0104',
        hospital: 'Northwestern Memorial Hospital',
        licenseNumber: 'MD-2016-23456',
        address: {
            line1: '321 Bone & Joint Blvd',
            line2: 'Chicago, IL 60601'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c11',
        name: 'Dr. Priya Patel',
        image: doc17,
        speciality: 'Dermatology',
        degree: 'MD',
        experience: '5 Years',
        about: 'Dr. Priya Patel specializes in medical and cosmetic dermatology. She provides expert care for skin conditions and aesthetic treatments using the latest dermatological innovations.',
        fees: 130,
        email: 'priya.patel@healthcare.com',
        phone: '+1-555-0105',
        hospital: 'Houston Methodist Hospital',
        licenseNumber: 'MD-2020-67890',
        address: {
            line1: '555 Skin Care Center',
            line2: 'Houston, TX 77001'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c12',
        name: 'Dr. Robert Williams',
        image: doc6,
        speciality: 'Oncology',
        degree: 'MD',
        experience: '10 Years',
        about: 'Dr. Robert Williams is a board-certified oncologist dedicated to cancer treatment and research. He provides comprehensive cancer care with a focus on personalized treatment plans and patient support.',
        fees: 200,
        email: 'robert.williams@healthcare.com',
        phone: '+1-555-0106',
        hospital: 'Penn Medicine',
        licenseNumber: 'MD-2015-12345',
        address: {
            line1: '888 Cancer Treatment Pkwy',
            line2: 'Philadelphia, PA 19101'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c13',
        name: 'Dr. Lisa Thompson',
        image: doc5,
        speciality: 'Gynecology',
        degree: 'MD',
        experience: '7 Years',
        about: 'Dr. Lisa Thompson provides comprehensive women\'s health care including obstetrics and gynecology. She is committed to empowering women through all stages of life with compassionate and expert care.',
        fees: 140,
        email: 'lisa.thompson@healthcare.com',
        phone: '+1-555-0107',
        hospital: 'Mayo Clinic Arizona',
        licenseNumber: 'MD-2018-78901',
        address: {
            line1: '999 Women\'s Health Ave',
            line2: 'Phoenix, AZ 85001'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c14',
        name: 'Dr. David Kim',
        image: doc8,
        speciality: 'Psychiatry',
        degree: 'MD',
        experience: '6 Years',
        about: 'Dr. David Kim specializes in mental health treatment with expertise in anxiety, depression, and behavioral disorders. He provides evidence-based psychiatric care in a supportive and confidential environment.',
        fees: 170,
        email: 'david.kim@healthcare.com',
        phone: '+1-555-0108',
        hospital: 'UCSF Medical Center',
        licenseNumber: 'MD-2019-89012',
        address: {
            line1: '111 Mental Health Dr',
            line2: 'San Francisco, CA 94101'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c15',
        name: 'Dr. Maria Garcia',
        image: doc2,
        speciality: 'Endocrinology',
        degree: 'MD',
        experience: '8 Years',
        about: 'Dr. Maria Garcia is an endocrinologist specializing in diabetes, thyroid disorders, and hormonal imbalances. She provides comprehensive endocrine care with a focus on lifestyle management and medication optimization.',
        fees: 150,
        email: 'maria.garcia@healthcare.com',
        phone: '+1-555-0109',
        hospital: 'Jackson Memorial Hospital',
        licenseNumber: 'MD-2017-90123',
        address: {
            line1: '222 Hormone Health St',
            line2: 'Miami, FL 33101'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c16',
        name: 'Dr. Thomas Brown',
        image: doc10,
        speciality: 'Gastroenterology',
        degree: 'MD',
        experience: '9 Years',
        about: 'Dr. Thomas Brown specializes in digestive system disorders with expertise in endoscopy and inflammatory bowel disease. He provides advanced diagnostic and therapeutic gastroenterology services.',
        fees: 160,
        email: 'thomas.brown@healthcare.com',
        phone: '+1-555-0110',
        hospital: 'Seattle Children\'s Hospital',
        licenseNumber: 'MD-2016-01234',
        address: {
            line1: '333 Digestive Care Ln',
            line2: 'Seattle, WA 98101'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c17',
        name: 'Dr. Jennifer Lee',
        image: doc11,
        speciality: 'Ophthalmology',
        degree: 'MD',
        experience: '4 Years',
        about: 'Dr. Jennifer Lee is an ophthalmologist specializing in eye care, cataract surgery, and vision correction. She uses cutting-edge technology to preserve and restore vision for her patients.',
        fees: 140,
        email: 'jennifer.lee@healthcare.com',
        phone: '+1-555-0111',
        hospital: 'Denver Health Medical Center',
        licenseNumber: 'MD-2020-11122',
        address: {
            line1: '444 Vision Care Rd',
            line2: 'Denver, CO 80201'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c18',
        name: 'Dr. Ahmed Hassan',
        image: doc12,
        speciality: 'Pulmonology',
        degree: 'MD',
        experience: '7 Years',
        about: 'Dr. Ahmed Hassan is a pulmonologist specializing in respiratory diseases including asthma, COPD, and lung infections. He provides comprehensive pulmonary care with a focus on improving breathing and quality of life.',
        fees: 155,
        email: 'ahmed.hassan@healthcare.com',
        phone: '+1-555-0112',
        hospital: 'Emory University Hospital',
        licenseNumber: 'MD-2018-22233',
        address: {
            line1: '555 Respiratory Ctr',
            line2: 'Atlanta, GA 30301'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c19',
        name: 'Dr. Rachel Cohen',
        image: doc15,
        speciality: 'Rheumatology',
        degree: 'MD',
        experience: '6 Years',
        about: 'Dr. Rachel Cohen specializes in autoimmune and musculoskeletal disorders. She provides expert care for conditions like arthritis, lupus, and other rheumatic diseases using the latest treatment protocols.',
        fees: 165,
        email: 'rachel.cohen@healthcare.com',
        phone: '+1-555-0113',
        hospital: 'Johns Hopkins Hospital',
        licenseNumber: 'MD-2019-33344',
        address: {
            line1: '666 Joint Care Blvd',
            line2: 'Baltimore, MD 21201'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c1a',
        name: 'Dr. Kevin O\'Brien',
        image: doc14,
        speciality: 'Urology',
        degree: 'MD',
        experience: '8 Years',
        about: 'Dr. Kevin O\'Brien is a urologist specializing in kidney, bladder, and prostate conditions. He provides advanced urological care with expertise in minimally invasive surgical techniques.',
        fees: 175,
        email: 'kevin.obrien@healthcare.com',
        phone: '+1-555-0114',
        hospital: 'Oregon Health & Science University',
        licenseNumber: 'MD-2017-44455',
        address: {
            line1: '777 Kidney Care Way',
            line2: 'Portland, OR 97201'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c1b',
        name: 'Dr. Aisha Mohammed',
        image: doc16,
        speciality: 'Radiology',
        degree: 'MD',
        experience: '3 Years',
        about: 'Dr. Aisha Mohammed is a radiologist specializing in diagnostic imaging including MRI, CT, and ultrasound. She provides accurate diagnoses using advanced imaging technology to guide treatment decisions.',
        fees: 135,
        email: 'aisha.mohammed@healthcare.com',
        phone: '+1-555-0115',
        hospital: 'Henry Ford Hospital',
        licenseNumber: 'MD-2020-55566',
        address: {
            line1: '888 Imaging Center',
            line2: 'Detroit, MI 48201'
        }
    },
    {
        _id: '674d1a2b3c4d5e6f7a8b9c1c',
        name: 'Dr. Muzammil Khan',
        image: doc1,
        speciality: 'Heart Surgeon',
        degree: 'MD',
        experience: '8 Years',
        about: 'Dr. Muzammil Khan is a highly skilled heart surgeon with expertise in cardiac surgery and transplantation. He is dedicated to providing life-saving cardiovascular care with compassion and precision.',
        fees: 250,
        email: 'muzammilahmedk3@healthcare.com',
        phone: '+1-555-0114',
        hospital: 'Oregon Health & Science University',
        licenseNumber: 'MD-2017-44455',
        address: {
            line1: '777 Kidney Care Way',
            line2: 'Portland, OR 97201'
        }
    }
]