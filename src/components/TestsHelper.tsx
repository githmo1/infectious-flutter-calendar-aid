
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TestProcedure, AnimalSpecies, storage } from '@/utils/storage';

const TestsHelper: React.FC = () => {
  const [tests, setTests] = useState<TestProcedure[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTests, setFilteredTests] = useState<TestProcedure[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestProcedure | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Test form state
  const [testName, setTestName] = useState('');
  const [testSteps, setTestSteps] = useState('');
  const [testMinAge, setTestMinAge] = useState('0');
  const [testMaxAge, setTestMaxAge] = useState('20');
  const [selectedSpecies, setSelectedSpecies] = useState<AnimalSpecies[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const speciesList: AnimalSpecies[] = ['sheep', 'goat', 'camel', 'horse', 'cat', 'dog', 'cow', 'buffalo'];
  
  // Load tests from storage
  useEffect(() => {
    const loadedTests = storage.getTests();
    setTests(loadedTests);
    setFilteredTests(loadedTests);
  }, []);
  
  // Filter tests when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTests(tests);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const results = tests.filter(test => {
      return (
        test.name.toLowerCase().includes(term) ||
        test.targetAnimals.some(animal => animal.toLowerCase().includes(term)) ||
        test.steps.some(step => step.toLowerCase().includes(term))
      );
    });
    
    setFilteredTests(results);
  }, [searchTerm, tests]);
  
  // Reset form state
  const resetForm = () => {
    setTestName('');
    setTestSteps('');
    setTestMinAge('0');
    setTestMaxAge('20');
    setSelectedSpecies([]);
    setErrors({});
  };
  
  // Initialize form for editing
  const initializeFormForEdit = (test: TestProcedure) => {
    setTestName(test.name);
    setTestSteps(test.steps.join('\n'));
    setTestMinAge(test.ageRange.min.toString());
    setTestMaxAge(test.ageRange.max.toString());
    setSelectedSpecies(test.targetAnimals);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!testName.trim()) {
      newErrors.testName = 'Test name is required';
    }
    
    if (!testSteps.trim()) {
      newErrors.testSteps = 'Test procedure steps are required';
    }
    
    if (selectedSpecies.length === 0) {
      newErrors.species = 'At least one animal species must be selected';
    }
    
    const minAge = Number(testMinAge);
    const maxAge = Number(testMaxAge);
    
    if (isNaN(minAge) || minAge < 0) {
      newErrors.testMinAge = 'Minimum age must be a non-negative number';
    }
    
    if (isNaN(maxAge) || maxAge <= 0) {
      newErrors.testMaxAge = 'Maximum age must be a positive number';
    }
    
    if (minAge >= maxAge) {
      newErrors.ageRange = 'Maximum age must be greater than minimum age';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const steps = testSteps.split('\n')
      .map(step => step.trim())
      .filter(step => step !== '');
    
    const testProcedure: TestProcedure = {
      id: selectedTest ? selectedTest.id : Date.now().toString(),
      name: testName.trim(),
      steps,
      targetAnimals: selectedSpecies,
      ageRange: {
        min: Number(testMinAge),
        max: Number(testMaxAge)
      }
    };
    
    // Save test
    const savedTest = storage.saveTest(testProcedure);
    
    // Update local state
    if (isEditing) {
      setTests(tests.map(t => t.id === savedTest.id ? savedTest : t));
    } else {
      setTests([...tests, savedTest]);
    }
    
    // Reset state and close form
    resetForm();
    setShowTestForm(false);
    setIsEditing(false);
    setSelectedTest(null);
  };
  
  // Handle species selection toggle
  const toggleSpecies = (species: AnimalSpecies) => {
    setSelectedSpecies(prevSelected => 
      prevSelected.includes(species)
        ? prevSelected.filter(s => s !== species)
        : [...prevSelected, species]
    );
  };
  
  // Handle test edit
  const handleEditTest = (test: TestProcedure) => {
    setSelectedTest(test);
    initializeFormForEdit(test);
    setIsEditing(true);
    setShowTestForm(true);
    setShowDetails(false);
  };
  
  // Handle test delete
  const handleDeleteTest = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      storage.deleteTest(id);
      setTests(tests.filter(t => t.id !== id));
      setShowDetails(false);
    }
  };
  
  // View test details
  const handleViewDetails = (test: TestProcedure) => {
    setSelectedTest(test);
    setShowDetails(true);
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search and Add bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tests by name or species..."
            className="w-full p-3 pl-10 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3 text-gray-500">🔍</div>
        </div>
        <Button 
          className="bg-butterfly hover:bg-butterfly/90"
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setSelectedTest(null);
            setShowTestForm(true);
          }}
        >
          Add Test
        </Button>
      </div>

      {/* Test list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.length > 0 ? (
          filteredTests.map(test => (
            <Card 
              key={test.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleViewDetails(test)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{test.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Age Range: {test.ageRange.min} - {test.ageRange.max} years
                </p>
                <div className="flex flex-wrap gap-2">
                  {test.targetAnimals.map(animal => (
                    <span
                      key={animal}
                      className="text-xs px-2 py-1 bg-butterfly/10 text-butterfly rounded-full"
                    >
                      {animal}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-sm text-gray-500">
                  {test.steps.length} {test.steps.length === 1 ? 'step' : 'steps'}
                </p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No tests found matching your search.' : 'No tests available. Add your first test!'}
            </p>
          </div>
        )}
      </div>

      {/* Test Form Dialog */}
      <Dialog open={showTestForm} onOpenChange={setShowTestForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Test' : 'Add Test'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Test Name */}
            <div className="space-y-2">
              <Label htmlFor="testName">
                Test Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="testName"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="e.g., Tuberculosis Test"
                className={errors.testName ? 'border-red-500' : ''}
              />
              {errors.testName && (
                <p className="text-red-500 text-xs">{errors.testName}</p>
              )}
            </div>

            {/* Test Procedure Steps */}
            <div className="space-y-2">
              <Label htmlFor="testSteps">
                Procedure Steps <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(One step per line)</span>
              </Label>
              <Textarea
                id="testSteps"
                value={testSteps}
                onChange={e => setTestSteps(e.target.value)}
                placeholder="1. Clean the area with antiseptic
2. Measure 2mm of tuberculin
3. Inject intradermally
4. Check for reaction after 72 hours"
                className={`min-h-[150px] ${errors.testSteps ? 'border-red-500' : ''}`}
              />
              {errors.testSteps && (
                <p className="text-red-500 text-xs">{errors.testSteps}</p>
              )}
            </div>

            {/* Target Animal Species */}
            <div className="space-y-2">
              <Label>
                Target Animal Species <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {speciesList.map(species => (
                  <div 
                    key={species}
                    className={`animal-option ${selectedSpecies.includes(species) ? 'selected' : ''}`}
                    onClick={() => toggleSpecies(species)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedSpecies.includes(species)}
                        onCheckedChange={() => toggleSpecies(species)}
                      />
                      <Label className="capitalize cursor-pointer">{species}</Label>
                    </div>
                  </div>
                ))}
              </div>
              {errors.species && (
                <p className="text-red-500 text-xs">{errors.species}</p>
              )}
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testMinAge">Minimum Age (years)</Label>
                <Input
                  id="testMinAge"
                  type="number"
                  min="0"
                  step="0.5"
                  value={testMinAge}
                  onChange={e => setTestMinAge(e.target.value)}
                  className={errors.testMinAge ? 'border-red-500' : ''}
                />
                {errors.testMinAge && (
                  <p className="text-red-500 text-xs">{errors.testMinAge}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="testMaxAge">Maximum Age (years)</Label>
                <Input
                  id="testMaxAge"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={testMaxAge}
                  onChange={e => setTestMaxAge(e.target.value)}
                  className={errors.testMaxAge ? 'border-red-500' : ''}
                />
                {errors.testMaxAge && (
                  <p className="text-red-500 text-xs">{errors.testMaxAge}</p>
                )}
              </div>
            </div>
            {errors.ageRange && (
              <p className="text-red-500 text-xs -mt-4">{errors.ageRange}</p>
            )}

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setShowTestForm(false);
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

      {/* Test Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTest?.name}</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Target Animals</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTest.targetAnimals.map(animal => (
                    <span
                      key={animal}
                      className="px-2 py-1 bg-butterfly/10 text-butterfly rounded-full"
                    >
                      {animal}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Age Range</h4>
                <p>{selectedTest.ageRange.min} - {selectedTest.ageRange.max} years</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm text-gray-500 dark:text-gray-400">Procedure Steps</h4>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedTest.steps.map((step, index) => (
                    <li key={index} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => handleEditTest(selectedTest)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteTest(selectedTest.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsHelper;
