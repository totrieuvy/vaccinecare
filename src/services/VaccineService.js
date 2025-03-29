import api from "../config/axios";

const VaccineService = {
  getAllVaccines: async () => {
    try {
      const response = await api.get('v1/vaccine');
      // Access the data array from the response
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      throw error;
    }
  },

  getVaccineById: async (vaccineId) => {
    try {
      const response = await api.get(`v1/vaccine/${vaccineId}`);
      // Access the data object from the response
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching vaccine details:', error);
      throw error;
    }
  }
};

export default VaccineService;