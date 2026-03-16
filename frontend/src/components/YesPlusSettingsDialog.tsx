import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

interface YesPlusSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsUpdated?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const YesPlusSettingsDialog = ({ open, onOpenChange, onSettingsUpdated }: YesPlusSettingsDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [link, setLink] = useState('');

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/settings/yesplus/link`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLink(data.link || 'https://asplace.artofliving.org/register');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Error",
        description: "Failed to load current settings",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!link.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid link",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/settings/yesplus/link`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ link })
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      toast({
        title: "Success",
        description: "YES+ link updated successfully",
      });

      onOpenChange(false);
      onSettingsUpdated?.();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit YES+ Registration Link</DialogTitle>
          <DialogDescription>
            Update the registration link for YES+ ASPLACE
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="link" className="text-sm font-medium">
                Registration Link
              </Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://asplace.artofliving.org/register"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the complete registration URL (with UTM parameters if needed)
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Current Link:</p>
              <div className="bg-background rounded p-3 border border-border">
                <p className="text-xs font-mono break-all text-foreground">
                  {link}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || fetching}
          >
            {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
