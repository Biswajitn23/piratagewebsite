import type { RequestHandler } from 'express';

const handler: RequestHandler = async (req, res) => {
  try {
    const now = new Date();
    
    // Check for New Year
    if (now.getMonth() === 0 && now.getDate() === 1) {
      return res.json({
        message: `New Year ${now.getFullYear()}`,
        isHappyEvent: true
      });
    }

    // Check for other special dates
    const specialDates = getSpecialDates(now.getFullYear());
    const todayKey = `${now.getMonth()}-${now.getDate()}`;
    
    if (specialDates[todayKey]) {
      return res.json({
        message: specialDates[todayKey],
        isHappyEvent: true
      });
    }

    // Default message
    res.json({
      message: "Welcome to Piratage Website",
      isHappyEvent: false
    });
  } catch (error) {
    console.error('Error fetching holiday status:', error);
    res.status(500).json({
      message: "Welcome to Piratage Website",
      isHappyEvent: false
    });
  }
};

export default handler;

function getSpecialDates(year: number): Record<string, string> {
  // Format: "month-date": "Holiday Name"
  // Month is 0-indexed (0 = January, 11 = December)
  // Based on 2026 India holiday calendar (dates vary yearly for lunar-based holidays)
  return {
    // January
    "0-1": `New Year ${year}`,
    "0-3": "Hazarat Ali's Birthday",
    "0-12": "National Youth Day",
    "0-13": "Lohri",
    "0-14": "Pongal / Makar Sankranti",
    "0-23": "Vasant Panchami",
    "0-26": "Republic Day",
    "0-30": "Martyrs' Day",
    
    // February
    "1-1": "Guru Ravidas Jayanti",
    "1-4": "World Cancer Day",
    "1-12": "Maharishi Dayanand Saraswati Jayanti",
    "1-15": "Maha Shivaratri",
    "1-19": "Shivaji Jayanti",
    "1-28": "National Science Day",
    
    // March
    "2-3": "Holika Dahana",
    "2-4": "Holi",
    "2-8": "International Women's Day",
    "2-16": "National Vaccination Day",
    "2-19": "Ugadi / Gudi Padwa",
    "2-20": "Jamat Ul-Vida",
    "2-21": "Ramzan Id / World Down Syndrome Day",
    "2-26": "Rama Navami",
    "2-31": "Mahavir Jayanti",
    
    // April
    "3-3": "Good Friday",
    "3-4": "World Heritage Day",
    "3-5": "Easter Day",
    "3-8": "Hanuman Jayanti",
    "3-14": "Vaisakhi / Ambedkar Jayanti",
    "3-15": "Bahag Bihu",
    "3-22": "Earth Day",
    
    // May
    "4-1": "Buddha Purnima / World Milk Day",
    "4-9": "Birthday of Rabindranath Tagore",
    "4-10": "Mother's Day",
    "4-22": "International Biodiversity Day",
    "4-27": "Bakrid / Eid al-Adha",
    "4-31": "Anti-Tobacco Day",
    
    // June
    "5-1": "World Milk Day",
    "5-5": "World Environment Day",
    "5-21": "Father's Day / International Day of Yoga",
    "5-26": "Muharram/Ashura",
    
    // July
    "6-1": "National Doctor's Day",
    "6-11": "World Population Day",
    "6-16": "Rath Yatra",
    "6-31": "Nag Panchami",
    
    // August
    "7-12": "International Youth Day",
    "7-15": "Independence Day",
    "7-19": "World Photography Day",
    "7-26": "Milad un-Nabi / Onam",
    "7-28": "Raksha Bandhan",
    "7-29": "National Sports Day",
    
    // September
    "8-4": "Janmashtami",
    "8-5": "Teachers' Day",
    "8-14": "Ganesh Chaturthi",
    "8-15": "National Engineer's Day",
    "8-16": "World Ozone Day",
    "8-17": "Vishwakarma Puja",
    
    // October
    "9-2": "Mahatma Gandhi Jayanti",
    "9-4": "World Animal Welfare Day",
    "9-9": "Maha Navami",
    "9-16": "Karva Chauth / World Food Day",
    "9-18": "Maha Saptami",
    "9-19": "Maha Ashtami",
    "9-20": "Dussehra",
    "9-21": "Lakshmi Puja / Kali Puja",
    "9-26": "Maharishi Valmiki Jayanti",
    "9-29": "Karaka Chaturthi",
    "9-31": "Halloween",
    
    // November
    "10-6": "Dhanteras",
    "10-8": "Diwali/Deepavali",
    "10-9": "Govardhan Puja / Annakut",
    "10-10": "World Science Day",
    "10-11": "Bhai Duj",
    "10-14": "Children's Day",
    "10-15": "Chhat Puja",
    "10-24": "Guru Nanak Jayanti / Guru Tegh Bahadur's Martyrdom Day",
    "10-26": "Constitution Day",
    
    // December
    "11-1": "World AIDS Day",
    "11-3": "International Day of Persons with Disabilities",
    "11-10": "Human Rights Day",
    "11-16": "Vijay Diwas",
    "11-23": "Hazarat Ali's Birthday",
    "11-24": "Christmas Eve",
    "11-25": "Christmas",
  };
}
