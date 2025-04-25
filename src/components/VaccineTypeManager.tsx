
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimalSpecies } from '@/utils/storage';
import { useToast } from "@/components/ui/use-toast";

interface VaccineType {
  id: string;
  name: string;
  totalDoses: number;
  daysInterval: number;
  targetAnimals: AnimalSpecies[];
}

const VaccineTypeManager: React.FC = () => {
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [name, setName] = useState('');
  const [totalDoses, setTotalDoses] = useState(1);
  const [daysInterval, setDaysInterval] = useState(0);
  const [selectedAnimals, setSelectedAnimals] = useState<AnimalSpecies[]>([]);
  const { toast } = useToast();

  const animalSpecies: AnimalSpecies[] = [
    'sheep', 'goat', 'camel', 'horse', 'cat', 'dog', 'cow', 'buffalo'
  ];

  useEffect(() => {
    const savedTypes = localStorage.getItem('vaccine_types');
    if (savedTypes) {
      setVaccineTypes(JSON.parse(savedTypes));
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a vaccine name",
        variant: "destructive"
      });
      return;
    }

    if (totalDoses > 1 && !daysInterval) {
      toast({
        title: "Error",
        description: "Please specify days interval for multiple doses",
        variant: "destructive"
      });
      return;
    }

    if (selectedAnimals.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one animal species",
        variant: "destructive"
      });
      return;
    }

    const newType: VaccineType = {
      id: Date.now().toString(),
      name,
      totalDoses,
      daysInterval,
      targetAnimals: selectedAnimals
    };

    const updatedTypes = [...vaccineTypes, newType];
    setVaccineTypes(updatedTypes);
    localStorage.setItem('vaccine_types', JSON.stringify(updatedTypes));

    setName('');
    setTotalDoses(1);
    setDaysInterval(0);
    setSelectedAnimals([]);

    toast({
      title: "Success",
      description: "Vaccine type added successfully"
    });
  };

  const handleDelete = (id: string) => {
    const updatedTypes = vaccineTypes.filter(type => type.id !== id);
    setVaccineTypes(updatedTypes);
    localStorage.setItem('vaccine_types', JSON.stringify(updatedTypes));
    
    toast({
      title: "Success",
      description: "Vaccine type deleted successfully"
    });
  };

  const toggleAnimal = (animal: AnimalSpecies) => {
    if (selectedAnimals.includes(animal)) {
      setSelectedAnimals(selectedAnimals.filter(a => a !== animal));
    } else {
      setSelectedAnimals([...selectedAnimals, animal]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Vaccine Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vaccine Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vaccine name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalDoses">Total Doses</Label>
            <Input
              id="totalDoses"
              type="number"
              min="1"
              value={totalDoses}
              onChange={(e) => setTotalDoses(Number(e.target.value))}
            />
          </div>

          {totalDoses > 1 && (
            <div className="space-y-2">
              <Label htmlFor="daysInterval">Days Between Doses</Label>
              <Input
                id="daysInterval"
                type="number"
                min="1"
                value={daysInterval}
                onChange={(e) => setDaysInterval(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="mt-4">
          <Label>Target Animals</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {animalSpecies.map((animal) => (
              <Button
                key={animal}
                type="button"
                variant={selectedAnimals.includes(animal) ? "default" : "outline"}
                className="capitalize"
                onClick={() => toggleAnimal(animal)}
              >
                {animal}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="mt-4 w-full bg-butterfly hover:bg-butterfly/90">
          Save Vaccine Type
        </Button>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Saved Vaccine Types</h3>
        {vaccineTypes.map((type) => (
          <Card key={type.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{type.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.totalDoses} {type.totalDoses === 1 ? 'dose' : 'doses'}
                  {type.totalDoses > 1 && ` (${type.daysInterval} days interval)`}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {type.targetAnimals.map((animal) => (
                    <span
                      key={animal}
                      className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded capitalize"
                    >
                      {animal}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(type.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VaccineTypeManager;
