import { createSlice } from "@reduxjs/toolkit";

export const selectedPackageSlice = createSlice({
  name: "selectedPackage",
  initialState: {
    packageId: null,
    packageName: "",
    packagePrice: 0,
    selectedVaccines: [], // This will store the selected vaccines from the package
    replacedVaccines: {}, // This will map original vaccineIds to replacement vaccineIds
    vaccinationDate: null,
  },
  reducers: {
    selectPackage: (state, action) => {
      const { packageId, packageName, price, vaccines } = action.payload;
      state.packageId = packageId;
      state.packageName = packageName;
      state.packagePrice = price;
      state.selectedVaccines = vaccines || [];
      state.replacedVaccines = {};
      state.vaccinationDate = null;
    },
    replaceVaccine: (state, action) => {
      const { originalVaccineId, newVaccine } = action.payload;

      // Store the replacement mapping
      state.replacedVaccines[originalVaccineId] = newVaccine.vaccineId;

      // Update the selected vaccines with the new one
      state.selectedVaccines = state.selectedVaccines.map((vaccine) =>
        vaccine.vaccineId === originalVaccineId
          ? { ...newVaccine, originalVaccineId } // Keep track of original ID
          : vaccine
      );
    },
    setVaccinationDate: (state, action) => {
      state.vaccinationDate = action.payload;
    },
    resetPackageSelection: (state) => {
      state.packageId = null;
      state.packageName = "";
      state.packagePrice = 0;
      state.selectedVaccines = [];
      state.replacedVaccines = {};
      state.vaccinationDate = null;
    },
  },
});

export const { selectPackage, replaceVaccine, setVaccinationDate, resetPackageSelection } =
  selectedPackageSlice.actions;

export default selectedPackageSlice.reducer;
