import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage, AnimalSpecies, Drug, AdministrationRoute, Prescription } from '@/utils/storage';

const DrugCalculator: React.FC = () => {
  
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies>('cow');
  const [weight, setWeight] = useState('');
  const [selectedDrugs, setSelectedDrugs] = useState<{
    drug: Drug;
    route: AdministrationRoute;
    calculatedDose: number;
  }[]>([]);
  const [animalId, setAnimalId] = useState('');
  
  const [showDrugForm, setShowDrugForm] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  
  // Drug form state
  const [drugName, setDrugName] = useState('');
  const [drugDosages, setDrugDosages] = useState<{ species: AnimalSpecies; dosage: number }[]>([
    { species: 'cow', dosage: 0 }
  ]);
  const [drugRoutes, setDrugRoutes] = useState<AdministrationRoute[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const speciesList: AnimalSpecies[] = ['sheep', 'goat', 'camel', 'horse', 'cat', 'dog', 'cow', 'buffalo'];
  
  const routesList: { value: AdministrationRoute; label: string }[] = [
    { value: 'sc', label: 'Subcutaneous (S/C)' },
    { value: 'im', label: 'Intramuscular (I/M)' },
    { value: 'oral', label: 'Oral' },
    { value: 'iv', label: 'Intravenous (I/V)' },
    { value: 'aural', label: 'Aural' },
    { value: 'topical', label: 'Topical' }
  ];
  
  // Load drugs from storage
  useEffect(() => {
    const loadedDrugs = storage.getDrugs();
    setDrugs(loadedDrugs);
  }, []);
  
  // Clear selected drugs when species changes
  useEffect(() => {
    setSelectedDrugs([]);
  }, [selectedSpecies]);
  
  // Reset drug form
  const resetDrugForm = () => {
    setDrugName('');
    setDrugDosages([{ species: 'cow', dosage: 0 }]);
    setDrugRoutes([]);
    setErrors({});
  };
  
  // Initialize form for editing
  const initializeFormForEdit = (drug: Drug) => {
    setDrugName(drug.name);
    setDrugDosages([...drug.dosages]);
    setDrugRoutes([...drug.routes]);
  };
  
  // Validate drug form
  const validateDrugForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!drugName.trim()) {
      newErrors.drugName = 'Drug name is required';
    }
    
    if (drugDosages.length === 0) {
      newErrors.dosages = 'At least one species dosage is required';
    } else {
      const invalidDosages = drugDosages.filter(d => d.dosage <= 0);
      if (invalidDosages.length > 0) {
        newErrors.dosages = 'All dosages must be positive numbers';
      }
    }
    
    if (drugRoutes.length === 0) {
      newErrors.routes = 'At least one administration route is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate prescription
  const validatePrescription = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!animalId.trim()) {
      newErrors.animalId = 'Animal ID is required';
    }
    
    if (!weight.trim() || isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = 'Valid weight is required';
    }
    
    if (selectedDrugs.length === 0) {
      newErrors.drugs = 'At least one drug must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle drug form submission
  const handleDrugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDrugForm()) {
      return;
    }
    
    const drug: Drug = {
      id: editingDrug ? editingDrug.id : Date.now().toString(),
      name: drugName.trim(),
      dosages: drugDosages,
      routes: drugRoutes
    };
    
    // Save drug
    const savedDrug = storage.saveDrug(drug);
    
    // Update local state
    if (editingDrug) {
      setDrugs(drugs.map(d => d.id === savedDrug.id ? savedDrug : d));
    } else {
      setDrugs([...drugs, savedDrug]);
    }
    
    // Reset state and close form
    resetDrugForm();
    setShowDrugForm(false);
    setEditingDrug(null);
  };
  
  // Handle prescription submission
  const handlePrescriptionSubmit = () => {
    if (!validatePrescription()) {
      return;
    }
    
    const prescription: Prescription = {
      id: Date.now().toString(),
      animalId: animalId.trim(),
      species: selectedSpecies,
      weight: Number(weight),
      drugs: selectedDrugs.map(sd => ({
        drugId: sd.drug.id,
        route: sd.route,
        calculatedDose: sd.calculatedDose
      })),
      date: new Date().toISOString()
    };
    
    // Save prescription
    storage.savePrescription(prescription);
    
    // Reset state and show confirmation
    printPrescription();
    setAnimalId('');
    setWeight('');
    setSelectedDrugs([]);
    setShowPrescription(false);
  };
  
  // Add/Edit dosage
  const handleDosageChange = (index: number, field: 'species' | 'dosage', value: any) => {
    const newDosages = [...drugDosages];
    if (field === 'species') {
      newDosages[index].species = value as AnimalSpecies;
    } else {
      newDosages[index].dosage = Number(value);
    }
    setDrugDosages(newDosages);
  };
  
  // Add new dosage
  const addDosage = () => {
    setDrugDosages([...drugDosages, { species: 'cow', dosage: 0 }]);
  };
  
  // Remove dosage
  const removeDosage = (index: number) => {
    if (drugDosages.length > 1) {
      const newDosages = [...drugDosages];
      newDosages.splice(index, 1);
      setDrugDosages(newDosages);
    }
  };
  
  // Toggle route selection - Fixed function
  const toggleRoute = (route: AdministrationRoute) => {
    setDrugRoutes(prevRoutes => {
      // Check if the route is already selected
      if (prevRoutes.includes(route)) {
        // If yes, remove it
        return prevRoutes.filter(r => r !== route);
      } else {
        // If no, add it
        return [...prevRoutes, route];
      }
    });
  };
  
  // Add drug to prescription
  const addDrugToPrescription = (drug: Drug) => {
    // Check if drug has dosage for selected species
    const speciesDosage = drug.dosages.find(d => d.species === selectedSpecies);
    if (!speciesDosage) {
      alert(`No dosage information available for ${selectedSpecies} for this drug.`);
      return;
    }
    
    // Check if drug already in prescription
    if (selectedDrugs.some(sd => sd.drug.id === drug.id)) {
      alert(`${drug.name} is already added to the prescription.`);
      return;
    }
    
    // Calculate dose based on weight and dosage
    const weightValue = Number(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      setErrors({ ...errors, weight: 'Valid weight is required to add drugs' });
      return;
    }
    
    // Get default route or first available
    let defaultRoute = drug.routes.includes('oral') ? 'oral' : drug.routes[0];
    
    // Add drug to selected drugs
    const calculatedDose = speciesDosage.dosage * weightValue;
    setSelectedDrugs([...selectedDrugs, {
      drug,
      route: defaultRoute,
      calculatedDose
    }]);
  };
  
  // Remove drug from prescription
  const removeDrugFromPrescription = (drugId: string) => {
    setSelectedDrugs(selectedDrugs.filter(sd => sd.drug.id !== drugId));
  };
  
  // Update drug route in prescription
  const updateDrugRoute = (drugId: string, route: AdministrationRoute) => {
    setSelectedDrugs(selectedDrugs.map(sd => 
      sd.drug.id === drugId ? { ...sd, route } : sd
    ));
  };
  
  // Print prescription
  const printPrescription = () => {
    // Create printable content
    const content = document.createElement('div');
    content.innerHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; color: #0EA5E9;">Infectious Butterfly</h1>
        <h2 style="text-align: center; margin-bottom: 30px;">Animal Prescription</h2>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Animal ID:</strong> ${animalId}</p>
          <p><strong>Species:</strong> ${selectedSpecies}</p>
          <p><strong>Weight:</strong> ${weight} kg</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Drug</th>
              <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Dosage</th>
              <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Route</th>
              <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Total Dose</th>
            </tr>
          </thead>
          <tbody>
            ${selectedDrugs.map(sd => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${sd.drug.name}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  ${sd.drug.dosages.find(d => d.species === selectedSpecies)?.dosage} mg/kg
                </td>
                <td style="padding: 10px; border: 1px solid #ddd;">${sd.route}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${sd.calculatedDose.toFixed(2)} mg</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 40px; text-align: right;">
          <p>Prescribed by: ______________________________</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="margin-top: 40px; font-size: 0.8em; text-align: center; color: #666;">
          <p>Generated by Infectious Butterfly - Veterinary Aid Tool</p>
        </div>
      </div>
    `;
    
    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${animalId}</title>
          </head>
          <body>
            ${content.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  // Delete drug
  const handleDeleteDrug = (id: string) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      storage.deleteDrug(id);
      setDrugs(drugs.filter(d => d.id !== id));
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Animal Info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Animal Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal ID</Label>
                <Input
                  id="animalId"
                  value={animalId}
                  onChange={e => setAnimalId(e.target.value)}
                  placeholder="e.g., COW-001"
                  className={errors.animalId ? 'border-red-500' : ''}
                />
                {errors.animalId && (
                  <p className="text-red-500 text-xs">{errors.animalId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Select value={selectedSpecies} onValueChange={(value) => setSelectedSpecies(value as AnimalSpecies)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesList.map(species => (
                      <SelectItem key={species} value={species}>
                        <span className="capitalize">{species}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="Weight in kilograms"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs">{errors.weight}</p>
                )}
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Drug Management</h3>
              <Button 
                size="sm"
                className="bg-butterfly hover:bg-butterfly/90"
                onClick={() => {
                  resetDrugForm();
                  setEditingDrug(null);
                  setShowDrugForm(true);
                }}
              >
                Add Drug
              </Button>
            </div>
            
            <div className="space-y-2">
              {drugs.length > 0 ? (
                drugs.map(drug => (
                  <div 
                    key={drug.id} 
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium">{drug.name}</p>
                      <p className="text-xs text-gray-500">
                        {drug.dosages.length} {drug.dosages.length === 1 ? 'dosage' : 'dosages'} | 
                        {' '}{drug.routes.length} {drug.routes.length === 1 ? 'route' : 'routes'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          initializeFormForEdit(drug);
                          setEditingDrug(drug);
                          setShowDrugForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrug(drug.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No drugs added yet. Add your first drug!
                </p>
              )}
            </div>
          </Card>
        </div>
        
        {/* Right column - Prescription Builder */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prescription Builder</h3>
            
            {Number(weight) > 0 ? (
              <>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Available Drugs for {selectedSpecies}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {drugs.filter(drug => 
                      drug.dosages.some(d => d.species === selectedSpecies)
                    ).map(drug => (
                      <Button
                        key={drug.id}
                        variant="outline"
                        className="justify-start text-left"
                        onClick={() => addDrugToPrescription(drug)}
                        disabled={selectedDrugs.some(sd => sd.drug.id === drug.id)}
                      >
                        <span>{drug.name}</span>
                        <span className="ml-auto text-xs">
                          {drug.dosages.find(d => d.species === selectedSpecies)?.dosage} mg/kg
                        </span>
                      </Button>
                    ))}
                  </div>
                  
                  {drugs.filter(drug => 
                    drug.dosages.some(d => d.species === selectedSpecies)
                  ).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No drugs available for {selectedSpecies}. Please add a drug with dosage information for this species.
                    </p>
                  )}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Selected Drugs</h4>
                  {selectedDrugs.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDrugs.map(({ drug, route, calculatedDose }) => (
                        <div key={drug.id} className="border rounded-md p-3">
                          <div className="flex justify-between mb-2">
                            <h5 className="font-medium">{drug.name}</h5>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeDrugFromPrescription(drug.id)}
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Dosage</p>
                              <p>
                                {drug.dosages.find(d => d.species === selectedSpecies)?.dosage} mg/kg
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Calculated Dose</p>
                              <p>{calculatedDose.toFixed(2)} mg</p>
                            </div>
                            
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Administration Route</p>
                              <Select 
                                value={route} 
                                onValueChange={(value) => updateDrugRoute(drug.id, value as AdministrationRoute)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select route" />
                                </SelectTrigger>
                                <SelectContent>
                                  {drug.routes.map(r => (
                                    <SelectItem key={r} value={r}>
                                      {routesList.find(rl => rl.value === r)?.label || r}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        className="w-full mt-4 bg-butterfly hover:bg-butterfly/90"
                        onClick={() => setShowPrescription(true)}
                      >
                        Generate Prescription
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No drugs selected for prescription yet.
                    </p>
                  )}
                  
                  {errors.drugs && (
                    <p className="text-red-500 text-xs mt-2">{errors.drugs}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Enter animal weight to start building a prescription.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Drug Form Dialog */}
      <Dialog open={showDrugForm} onOpenChange={setShowDrugForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDrug ? 'Edit Drug' : 'Add Drug'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDrugSubmit} className="space-y-6">
            {/* Drug Name */}
            <div className="space-y-2">
              <Label htmlFor="drugName">
                Drug Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="drugName"
                value={drugName}
                onChange={e => setDrugName(e.target.value)}
                placeholder="e.g., Amoxicillin"
                className={errors.drugName ? 'border-red-500' : ''}
              />
              {errors.drugName && (
                <p className="text-red-500 text-xs">{errors.drugName}</p>
              )}
            </div>

            {/* Dosages */}
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label>
                  Dosages (mg/kg) <span className="text-red-500">*</span>
                </Label>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={addDosage}
                >
                  Add Species
                </Button>
              </div>
              
              {errors.dosages && (
                <p className="text-red-500 text-xs">{errors.dosages}</p>
              )}
              
              <div className="space-y-3">
                {drugDosages.map((dosage, index) => (
                  <div key={index} className="flex space-x-2">
                    <Select 
                      value={dosage.species} 
                      onValueChange={(value) => handleDosageChange(index, 'species', value)}
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesList.map(species => (
                          <SelectItem key={species} value={species}>
                            <span className="capitalize">{species}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={dosage.dosage}
                      onChange={e => handleDosageChange(index, 'dosage', e.target.value)}
                      placeholder="Dosage in mg/kg"
                      className="w-1/2"
                    />
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeDosage(index)}
                      disabled={drugDosages.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Administration Routes */}
            <div className="space-y-2">
              <Label>
                Administration Routes <span className="text-red-500">*</span>
              </Label>
              
              {errors.routes && (
                <p className="text-red-500 text-xs">{errors.routes}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {routesList.map(route => (
                  <div 
                    key={route.value}
                    className={`animal-option ${drugRoutes.includes(route.value) ? 'selected' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`route-${route.value}`}
                        checked={drugRoutes.includes(route.value)}
                        onCheckedChange={() => toggleRoute(route.value)}
                      />
                      <Label 
                        htmlFor={`route-${route.value}`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault(); 
                          toggleRoute(route.value);
                        }}
                      >
                        {route.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetDrugForm();
                  setShowDrugForm(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-butterfly hover:bg-butterfly/90">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Prescription Dialog */}
      <Dialog open={showPrescription} onOpenChange={setShowPrescription}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Prescription</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Animal ID</Label>
                <p className="font-medium">{animalId || '(Not specified)'}</p>
              </div>
              <div>
                <Label>Species</Label>
                <p className="font-medium capitalize">{selectedSpecies}</p>
              </div>
              <div>
                <Label>Weight</Label>
                <p className="font-medium">{weight} kg</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <Label>Selected Medications</Label>
              <div className="mt-2 border rounded-md divide-y">
                {selectedDrugs.map(({ drug, route, calculatedDose }) => (
                  <div key={drug.id} className="p-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{drug.name}</p>
                      <p className="text-sm">
                        {routesList.find(r => r.value === route)?.label || route}
                      </p>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {drug.dosages.find(d => d.species === selectedSpecies)?.dosage} mg/kg × {weight} kg = {calculatedDose.toFixed(2)} mg
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline"
                onClick={() => setShowPrescription(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-butterfly hover:bg-butterfly/90"
                onClick={handlePrescriptionSubmit}
              >
                Confirm & Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrugCalculator;
