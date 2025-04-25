import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getTodayString, getCurrentTime, addDays, combineDateAndTime } from '@/utils/dateUtils';
import { Vaccination, AnimalSpecies } from '@/utils/storage';
import { scheduleVaccinationReminders } from '@/utils/notifications';

interface VaccineFormProps {
  existingVaccination?: Vaccination | null;
  onSave: (vaccination: Vaccination) => void;
  onCancel: () => void;
}

const VaccineForm: React.FC<VaccineFormProps> = ({ existingVaccination, onSave, onCancel }) => {
  const [animalId, setAnimalId] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [isPregnant, setIsPregnant] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [vaccineDate, setVaccineDate] = useState(getTodayString());
  const [vaccineTime, setVaccineTime] = useState(getCurrentTime());
  const [vaccineType, setVaccineType] = useState('');
  const [totalDoses, setTotalDoses] = useState(1);
  const [daysInterval, setDaysInterval] = useState(0);
  const [species, setSpecies] = useState<AnimalSpecies>('cow');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fill form with existing data if editing
  useEffect(() => {
    if (existingVaccination) {
      setAnimalId(existingVaccination.animalId);
      setAge(existingVaccination.age.toString());
      setSex(existingVaccination.sex);
      setIsPregnant(existingVaccination.isPregnant || false);
      setOwnerPhone(existingVaccination.ownerPhone);
      
      // Extract date and time from ISO string
      const vaccineDateTime = new Date(existingVaccination.vaccineTime);
      const dateStr = vaccineDateTime.toISOString().split('T')[0];
      const timeStr = vaccineDateTime.toTimeString().slice(0, 5);
      
      setVaccineDate(dateStr);
      setVaccineTime(timeStr);
      setVaccineType(existingVaccination.vaccineType);
      setSpecies(existingVaccination.species);
      setNotes(existingVaccination.notes || '');
      
      // Calculate total doses and days interval from existing doses
      setTotalDoses(existingVaccination.doses.length);
      
      // Calculate days interval if there are at least 2 doses
      if (existingVaccination.doses.length >= 2) {
        const date1 = new Date(existingVaccination.doses[0].date);
        const date2 = new Date(existingVaccination.doses[1].date);
        const diffTime = date2.getTime() - date1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysInterval(diffDays);
      }
    }
  }, [existingVaccination]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!animalId.trim()) {
      newErrors.animalId = 'Animal ID is required';
    }
    
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(age)) || Number(age) <= 0) {
      newErrors.age = 'Age must be a positive number';
    }
    
    if (!ownerPhone.trim()) {
      newErrors.ownerPhone = 'Owner phone is required';
    }
    
    if (!vaccineType.trim()) {
      newErrors.vaccineType = 'Vaccine type is required';
    }
    
    if (totalDoses < 1) {
      newErrors.totalDoses = 'At least one dose is required';
    }
    
    if (totalDoses > 1 && daysInterval <= 0) {
      newErrors.daysInterval = 'Days interval must be positive for multiple doses';
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
    
    // Calculate vaccine time as ISO string
    const vaccineTimeISO = combineDateAndTime(vaccineDate, vaccineTime);
    
    // Generate doses array
    const doses = [];
    for (let i = 0; i < totalDoses; i++) {
      let doseDate = vaccineTimeISO;
      if (i > 0) {
        doseDate = addDays(vaccineTimeISO, i * daysInterval);
      }
      
      // Keep administration status for existing doses if editing
      let administered = false;
      if (existingVaccination && existingVaccination.doses[i]) {
        administered = existingVaccination.doses[i].administered;
      } else if (i === 0) {
        // First dose is administered by default for new vaccinations
        administered = !existingVaccination;
      }
      
      doses.push({
        number: i + 1,
        date: doseDate,
        administered
      });
    }
    
    // Create vaccination object
    const vaccination: Vaccination = {
      id: existingVaccination ? existingVaccination.id : Date.now().toString(),
      animalId,
      age: Number(age),
      sex,
      ...(sex === 'female' && Number(age) > 1.5 && { isPregnant }),
      ownerPhone,
      vaccineTime: vaccineTimeISO,
      vaccineType,
      doses,
      species,
      notes: notes.trim() || undefined
    };
    
    // Save vaccination
    onSave(vaccination);
    
    // Schedule notifications for doses
    doses.forEach(dose => {
      if (!dose.administered) {
        scheduleVaccinationReminders(animalId, vaccineType, dose.number, dose.date);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Animal ID */}
        <div className="space-y-2">
          <Label htmlFor="animalId">
            Animal ID <span className="text-red-500">*</span>
          </Label>
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

        {/* Animal Age */}
        <div className="space-y-2">
          <Label htmlFor="age">
            Age (years) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="0"
            step="0.5"
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="e.g., 2.5"
            className={errors.age ? 'border-red-500' : ''}
          />
          {errors.age && (
            <p className="text-red-500 text-xs">{errors.age}</p>
          )}
        </div>

        {/* Animal Sex */}
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select value={sex} onValueChange={(value) => setSex(value as 'male' | 'female')}>
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pregnancy Status (conditional) */}
        {sex === 'female' && Number(age) > 1.5 && (
          <div className="space-y-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPregnant"
                checked={isPregnant}
                onCheckedChange={(checked) => setIsPregnant(!!checked)}
              />
              <Label htmlFor="isPregnant">Pregnant</Label>
            </div>
          </div>
        )}

        {/* Owner Phone */}
        <div className="space-y-2">
          <Label htmlFor="ownerPhone">
            Owner Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ownerPhone"
            value={ownerPhone}
            onChange={e => setOwnerPhone(e.target.value)}
            placeholder="e.g., 555-1234"
            className={errors.ownerPhone ? 'border-red-500' : ''}
          />
          {errors.ownerPhone && (
            <p className="text-red-500 text-xs">{errors.ownerPhone}</p>
          )}
        </div>

        {/* Species */}
        <div className="space-y-2">
          <Label htmlFor="species">Animal Species</Label>
          <Select value={species} onValueChange={(value) => setSpecies(value as AnimalSpecies)}>
            <SelectTrigger>
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cow">Cow</SelectItem>
              <SelectItem value="buffalo">Buffalo</SelectItem>
              <SelectItem value="sheep">Sheep</SelectItem>
              <SelectItem value="goat">Goat</SelectItem>
              <SelectItem value="horse">Horse</SelectItem>
              <SelectItem value="camel">Camel</SelectItem>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
              <SelectItem value="custom">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vaccine Date */}
        <div className="space-y-2">
          <Label htmlFor="vaccineDate">Vaccination Date</Label>
          <Input
            id="vaccineDate"
            type="date"
            value={vaccineDate}
            onChange={e => setVaccineDate(e.target.value)}
          />
        </div>

        {/* Vaccine Time */}
        <div className="space-y-2">
          <Label htmlFor="vaccineTime">Vaccination Time</Label>
          <Input
            id="vaccineTime"
            type="time"
            value={vaccineTime}
            onChange={e => setVaccineTime(e.target.value)}
          />
        </div>

        {/* Vaccine Type */}
        <div className="space-y-2">
          <Label htmlFor="vaccineType">
            Vaccine Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="vaccineType"
            value={vaccineType}
            onChange={e => setVaccineType(e.target.value)}
            placeholder="e.g., FMD Vaccine"
            className={errors.vaccineType ? 'border-red-500' : ''}
          />
          {errors.vaccineType && (
            <p className="text-red-500 text-xs">{errors.vaccineType}</p>
          )}
        </div>

        {/* Total Doses */}
        <div className="space-y-2">
          <Label htmlFor="totalDoses">
            Total Doses <span className="text-red-500">*</span>
          </Label>
          <Input
            id="totalDoses"
            type="number"
            min="1"
            value={totalDoses}
            onChange={e => setTotalDoses(Number(e.target.value))}
            className={errors.totalDoses ? 'border-red-500' : ''}
          />
          {errors.totalDoses && (
            <p className="text-red-500 text-xs">{errors.totalDoses}</p>
          )}
        </div>

        {/* Days Interval (conditional) */}
        {totalDoses > 1 && (
          <div className="space-y-2">
            <Label htmlFor="daysInterval">
              Days Between Doses <span className="text-red-500">*</span>
            </Label>
            <Input
              id="daysInterval"
              type="number"
              min="1"
              value={daysInterval}
              onChange={e => setDaysInterval(Number(e.target.value))}
              className={errors.daysInterval ? 'border-red-500' : ''}
            />
            {errors.daysInterval && (
              <p className="text-red-500 text-xs">{errors.daysInterval}</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-butterfly hover:bg-butterfly/90">
          Save
        </Button>
      </div>
    </form>
  );
};

export default VaccineForm;
