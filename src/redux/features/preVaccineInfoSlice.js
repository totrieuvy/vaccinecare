import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doctorId: null,
  weight: "",
  height: "",
  temperature: "",
  bloodPressure: "",
  pulse: 0,
  medicalHistory: "",
  chronicDiseases: [],
  otherDiseases: "",
  currentMedications: "",
  previousVaccineReactions: "",
  batchId: "",
};

export const preVaccineInfoSlice = createSlice({
  name: "preVaccineInfo",
  initialState,
  reducers: {
    setPreVaccineInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetPreVaccineInfo: () => initialState,
  },
});

export const { setPreVaccineInfo, resetPreVaccineInfo } = preVaccineInfoSlice.actions;

export default preVaccineInfoSlice.reducer;
