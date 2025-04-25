
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCalendarDates, formatCalendarDate, isToday } from '@/utils/dateUtils';
import { Vaccination, storage, AnimalSpecies } from '@/utils/storage';
import VaccineForm from './VaccineForm';

const VaccinationCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState<Date[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateVaccinations, setDateVaccinations] = useState<Vaccination[]>([]);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Vaccination[]>([]);
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Initialize calendar dates
  useEffect(() => {
    const dates = getCalendarDates(currentDate.getFullYear(), currentDate.getMonth());
    setCalendarDates(dates);
  }, [currentDate]);

  // Load vaccinations from storage
  useEffect(() => {
    const loadedVaccinations = storage.getVaccinations();
    setVaccinations(loadedVaccinations);
  }, []);

  // Filter vaccinations for selected date
  useEffect(() => {
    if (!selectedDate) {
      setDateVaccinations([]);
      return;
    }

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    const filtered = vaccinations.filter(vaccination => {
      return vaccination.doses.some(dose => {
        const doseDate = new Date(dose.date).toISOString().split('T')[0];
        return doseDate === selectedDateStr;
      });
    });

    setDateVaccinations(filtered);
  }, [selectedDate, vaccinations]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const results = vaccinations.filter(vaccination => {
      return (
        vaccination.animalId.toLowerCase().includes(term) ||
        vaccination.vaccineType.toLowerCase().includes(term) ||
        vaccination.species.toLowerCase().includes(term) ||
        vaccination.age.toString().includes(term)
      );
    });

    setSearchResults(results);
  }, [searchTerm, vaccinations]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Save vaccination
  const handleSaveVaccination = (vaccination: Vaccination) => {
    const savedVaccination = storage.saveVaccination(vaccination);
    
    // Update local state
    if (isEditing) {
      setVaccinations(vaccinations.map(v => v.id === savedVaccination.id ? savedVaccination : v));
    } else {
      setVaccinations([...vaccinations, savedVaccination]);
    }
    
    setShowVaccineForm(false);
    setIsEditing(false);
    setSelectedVaccination(null);
  };

  // Edit vaccination
  const handleEditVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setIsEditing(true);
    setShowVaccineForm(true);
  };

  // Delete vaccination
  const handleDeleteVaccination = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vaccination?')) {
      storage.deleteVaccination(id);
      setVaccinations(vaccinations.filter(v => v.id !== id));
      setShowDetails(false);
    }
  };

  // View vaccination details
  const handleViewDetails = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination);
    setShowDetails(true);
  };

  // Has vaccinations on date
  const hasVaccinationsOnDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return vaccinations.some(vaccination => {
      return vaccination.doses.some(dose => {
        const doseDate = new Date(dose.date).toISOString().split('T')[0];
        return doseDate === dateStr;
      });
    });
  };

  // Month name and year
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search and Add bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by ID, vaccine, age, or species..."
            className="w-full p-3 pl-10 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3 text-gray-500">🔍</div>
        </div>
        <Button 
          className="bg-butterfly hover:bg-butterfly/90"
          onClick={() => {
            setSelectedVaccination(null);
            setIsEditing(false);
            setShowVaccineForm(true);
          }}
        >
          Add Vaccination
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Search Results</h3>
          <div className="space-y-2">
            {searchResults.map(vaccination => (
              <Card
                key={vaccination.id}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleViewDetails(vaccination)}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{vaccination.animalId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vaccination.vaccineType} - {vaccination.species}
                    </p>
                  </div>
                  <div className="text-sm">
                    Age: {vaccination.age} {vaccination.age === 1 ? 'year' : 'years'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" onClick={prevMonth}>
            Previous
          </Button>
          <h2 className="text-xl font-bold">{monthYear}</h2>
          <Button variant="outline" onClick={nextMonth}>
            Next
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day names */}
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar dates */}
          {calendarDates.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isTodayDate = isToday(date.toISOString());
            const hasVaccines = hasVaccinationsOnDate(date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  min-h-[80px] p-2 rounded-md cursor-pointer border
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'} 
                  ${isTodayDate ? 'border-butterfly dark:border-butterfly' : 'border-transparent'}
                  ${selectedDate && date.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-butterfly' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={isTodayDate ? 'font-bold text-butterfly' : ''}>{date.getDate()}</span>
                  {hasVaccines && <div className="vaccine-dot"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date vaccinations */}
      {selectedDate && dateVaccinations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">
            Vaccinations for {formatCalendarDate(selectedDate.toISOString())}
          </h3>
          <div className="space-y-2">
            {dateVaccinations.map(vaccination => (
              <Card
                key={vaccination.id}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleViewDetails(vaccination)}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{vaccination.animalId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vaccination.vaccineType}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {vaccination.doses.map(dose => {
                      if (new Date(dose.date).toDateString() === selectedDate.toDateString()) {
                        return (
                          <div 
                            key={dose.number}
                            className="text-xs px-2 py-1 bg-butterfly-accent/20 text-butterfly-accent rounded-full"
                          >
                            Dose {dose.number}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vaccine Form Dialog */}
      <Dialog open={showVaccineForm} onOpenChange={setShowVaccineForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Vaccination' : 'Add Vaccination'}</DialogTitle>
          </DialogHeader>
          <VaccineForm
            existingVaccination={selectedVaccination}
            onSave={handleSaveVaccination}
            onCancel={() => setShowVaccineForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Vaccination Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vaccination Details</DialogTitle>
          </DialogHeader>
          {selectedVaccination && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Animal ID</h4>
                  <p className="font-semibold">{selectedVaccination.animalId}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Species</h4>
                  <p className="font-semibold capitalize">{selectedVaccination.species}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Age</h4>
                  <p>{selectedVaccination.age} {selectedVaccination.age === 1 ? 'year' : 'years'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Sex</h4>
                  <p className="capitalize">{selectedVaccination.sex}</p>
                </div>
                {selectedVaccination.sex === 'female' && selectedVaccination.age > 1.5 && (
                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-400">Pregnancy Status</h4>
                    <p>{selectedVaccination.isPregnant ? 'Pregnant' : 'Not Pregnant'}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Owner Phone</h4>
                  <p>{selectedVaccination.ownerPhone}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Vaccine Type</h4>
                  <p>{selectedVaccination.vaccineType}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Doses</h4>
                <div className="space-y-2">
                  {selectedVaccination.doses.map((dose) => (
                    <div 
                      key={dose.number} 
                      className={`p-3 rounded-md ${
                        dose.administered 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Dose {dose.number}</span>
                        <span className={`text-sm ${
                          dose.administered 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatCalendarDate(dose.date)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-sm">
                          Status: {dose.administered ? 'Administered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVaccination.notes && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400">Notes</h4>
                  <p>{selectedVaccination.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => handleEditVaccination(selectedVaccination)}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteVaccination(selectedVaccination.id)}
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

export default VaccinationCalendar;
