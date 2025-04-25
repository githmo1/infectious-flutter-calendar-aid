
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { storage } from '@/utils/storage';

interface CreditsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Credits: React.FC<CreditsProps> = ({ isDarkMode, toggleTheme }) => {
  const [exportData, setExportData] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  // Handle data export
  const handleExportData = () => {
    const data = storage.exportData();
    setExportData(data);
    
    // Create download link
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.href = url;
    link.download = `infectious_butterfly_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Data Exported Successfully",
      description: "Your data has been exported to a JSON file.",
    });
  };
  
  // Handle data import
  const handleImportData = () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          const jsonString = e.target.result as string;
          const success = storage.importData(jsonString);
          
          if (success) {
            toast({
              title: "Data Imported Successfully",
              description: "Your data has been restored. Please refresh the page to see the changes.",
            });
            setImportFile(null);
          } else {
            toast({
              title: "Import Failed",
              description: "There was an error importing your data. Please check the file format.",
              variant: "destructive",
            });
          }
        }
      } catch (err) {
        console.error('Error importing data:', err);
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(importFile);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch 
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            {/* Data Management */}
            <div className="space-y-4">
              <h3 className="font-medium">Data Management</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportData}
                >
                  Export All Data
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Download all your data as a JSON file for backup
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="import-file">Select Backup File</Label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gray-100 file:text-gray-700
                      dark:file:bg-gray-800 dark:file:text-gray-200
                      hover:file:bg-gray-200 dark:hover:file:bg-gray-700
                      file:cursor-pointer"
                  />
                </div>
                <Button 
                  onClick={handleImportData}
                  disabled={!importFile}
                  className="w-full justify-start"
                >
                  Import Data
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Restore your data from a backup file
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Credits Card */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">About</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Infectious Butterfly</h3>
              <p className="text-gray-600 dark:text-gray-400">
                A comprehensive veterinary management tool for tracking vaccinations,
                test procedures, and medication dosages.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Developer</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Developed by Ahmed Ismail - Batch 60<br />
                Assiut University<br />
                Special thanks to Assiut Infectious Diseases Department
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Privacy</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This application stores all data locally on your device using browser storage.
                No data is sent to external servers, and no tracking is performed.
              </p>
            </div>
            
            <div className="text-center pt-4">
              <div className="text-5xl animate-float">🦋</div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                © 2025 Infectious Butterfly
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Credits;
