import { initializeBlockchain, getContract } from './blockchain';
import { retrievePatientData } from './ipfs-mock';

/**
 * Get all patient records from blockchain events
 * This function scans blockchain events to find all patient records
 */
export const getAllPatientRecords = async () => {
  try {
    const { provider } = await initializeBlockchain();
    const contract = getContract(provider);
    
    // Get all RecordAdded events from the contract
    const filter = contract.filters.RecordAdded();
    const events = await contract.queryFilter(filter);
    
    const patientRecords = [];
    
    for (const event of events) {
      try {
        const { patientIdHash, ipfsHash, timestamp } = event.args;
        
        // Retrieve patient data from IPFS
        const ipfsResult = await retrievePatientData(ipfsHash);
        
        if (ipfsResult.success) {
          const patientData = ipfsResult.data;
          
          // Add blockchain metadata
          patientRecords.push({
            ...patientData,
            blockchainData: {
              patientIdHash,
              ipfsHash,
              timestamp: new Date(Number(timestamp) * 1000).toISOString(),
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash
            }
          });
        }
      } catch (error) {
        console.warn('Error processing event:', error);
        // Continue with other records
      }
    }
    
    return {
      success: true,
      data: patientRecords,
      totalRecords: patientRecords.length
    };
    
  } catch (error) {
    console.error('Error fetching all patient records:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get patient records from localStorage (for demo purposes)
 * In a real application, this would fetch from blockchain
 */
export const getStoredPatientRecords = () => {
  try {
    const storage = localStorage.getItem('mockIPFSStorage');
    if (!storage) return { success: true, data: [], totalRecords: 0 };
    
    const storageMap = new Map(JSON.parse(storage));
    const patientRecords = [];
    
    for (const [ipfsHash, data] of storageMap) {
      if (data && typeof data === 'object' && data.name) {
        patientRecords.push({
          ...data,
          ipfsHash
        });
      }
    }
    
    return {
      success: true,
      data: patientRecords,
      totalRecords: patientRecords.length
    };
  } catch (error) {
    console.error('Error getting stored patient records:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Analyze gender distribution for diseases
 */
export const getGenderDiseaseAnalysis = (patients) => {
  const analysis = {
    male: {},
    female: {}
  };
  
  patients.forEach(patient => {
    const gender = patient.gender?.toLowerCase();
    const disease = patient.disease || 'Not Specified';
    
    if (gender === 'male' || gender === 'female') {
      if (!analysis[gender][disease]) {
        analysis[gender][disease] = 0;
      }
      analysis[gender][disease]++;
    }
  });
  
  return analysis;
};

/**
 * Analyze age group distribution
 */
export const getAgeGroupAnalysis = (patients) => {
  const ageGroups = {
    '18-30': 0,
    '31-45': 0,
    '46-60': 0,
    '61-75': 0,
    '76+': 0
  };
  
  patients.forEach(patient => {
    const age = parseInt(patient.age);
    if (isNaN(age)) return;
    
    if (age >= 18 && age <= 30) ageGroups['18-30']++;
    else if (age >= 31 && age <= 45) ageGroups['31-45']++;
    else if (age >= 46 && age <= 60) ageGroups['46-60']++;
    else if (age >= 61 && age <= 75) ageGroups['61-75']++;
    else if (age >= 76) ageGroups['76+']++;
  });
  
  return ageGroups;
};

/**
 * Analyze blood pressure categories
 */
export const getBloodPressureAnalysis = (patients) => {
  const bpCategories = {
    'Normal': 0,
    'Elevated': 0,
    'High Stage 1': 0,
    'High Stage 2': 0,
    'Crisis': 0,
    'Not Measured': 0
  };
  
  patients.forEach(patient => {
    const bp = patient.bloodPressure;
    if (!bp || bp === 'Not measured') {
      bpCategories['Not Measured']++;
      return;
    }
    
    try {
      const [systolic, diastolic] = bp.split('/').map(Number);
      
      if (isNaN(systolic) || isNaN(diastolic)) {
        bpCategories['Not Measured']++;
        return;
      }
      
      if (systolic < 120 && diastolic < 80) bpCategories['Normal']++;
      else if (systolic < 130 && diastolic < 80) bpCategories['Elevated']++;
      else if (systolic < 140 || diastolic < 90) bpCategories['High Stage 1']++;
      else if (systolic < 180 || diastolic < 120) bpCategories['High Stage 2']++;
      else bpCategories['Crisis']++;
    } catch (error) {
      bpCategories['Not Measured']++;
    }
  });
  
  return bpCategories;
};

/**
 * Analyze heart disease by gender
 */
export const getHeartDiseaseByGender = (patients) => {
  const analysis = {
    male: { yes: 0, no: 0, not_specified: 0 },
    female: { yes: 0, no: 0, not_specified: 0 }
  };
  
  patients.forEach(patient => {
    const gender = patient.gender?.toLowerCase();
    const heartDisease = patient.heartDisease?.toLowerCase();
    
    if (gender === 'male' || gender === 'female') {
      if (heartDisease === 'yes') analysis[gender].yes++;
      else if (heartDisease === 'no') analysis[gender].no++;
      else analysis[gender].not_specified++;
    }
  });
  
  return analysis;
};

/**
 * Analyze time-based trends
 */
export const getTimeBasedAnalysis = (patients) => {
  const monthlyData = {};
  
  patients.forEach(patient => {
    let timestamp;
    
    // Try to get timestamp from different sources
    if (patient.blockchainData?.timestamp) {
      timestamp = new Date(patient.blockchainData.timestamp);
    } else if (patient.metadata?.timestamp) {
      timestamp = new Date(patient.metadata.timestamp);
    } else if (patient.timestamp) {
      timestamp = new Date(patient.timestamp);
    } else {
      return; // Skip if no timestamp
    }
    
    const monthYear = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    monthlyData[monthYear]++;
  });
  
  return monthlyData;
};

/**
 * Analyze disease prevalence
 */
export const getDiseasePrevalence = (patients) => {
  const diseaseCount = {};
  
  patients.forEach(patient => {
    const disease = patient.disease || 'Not Specified';
    if (!diseaseCount[disease]) {
      diseaseCount[disease] = 0;
    }
    diseaseCount[disease]++;
  });
  
  return diseaseCount;
};

/**
 * Get comprehensive analytics data
 */
export const getComprehensiveAnalytics = async () => {
  try {
    // Try to get data from blockchain first, fallback to localStorage
    let result = await getAllPatientRecords();
    
    if (!result.success || result.data.length === 0) {
      console.log('No blockchain data found, using stored data');
      result = getStoredPatientRecords();
    }
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    const patients = result.data;
    
    return {
      success: true,
      totalPatients: patients.length,
      analytics: {
        genderDisease: getGenderDiseaseAnalysis(patients),
        ageGroups: getAgeGroupAnalysis(patients),
        bloodPressure: getBloodPressureAnalysis(patients),
        heartDisease: getHeartDiseaseByGender(patients),
        timeTrends: getTimeBasedAnalysis(patients),
        diseasePrevalence: getDiseasePrevalence(patients)
      },
      rawData: patients
    };
    
  } catch (error) {
    console.error('Error getting comprehensive analytics:', error);
    return {
      success: false,
      error: error.message,
      totalPatients: 0,
      analytics: null,
      rawData: []
    };
  }
};
