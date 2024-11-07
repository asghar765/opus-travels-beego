"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";

type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  type: 'airport';
};

interface AirportSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function AirportSearch({ value, onChange, placeholder }: AirportSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [airports, setAirports] = React.useState<Airport[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const selectedAirport = airports.find((airport) => airport.code === value);

  React.useEffect(() => {
    const searchAirports = async () => {
      if (debouncedSearchTerm.length < 2) {
        setAirports([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/airports/search?query=${encodeURIComponent(debouncedSearchTerm)}`
        );
        if (!response.ok) throw new Error('Failed to fetch airports');
        const data = await response.json();
        setAirports(data);
      } catch (error) {
        console.error('Failed to fetch airports:', error);
        setAirports([]);
      } finally {
        setLoading(false);
      }
    };

    searchAirports();
  }, [debouncedSearchTerm]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedAirport ? (
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span>
                {selectedAirport.city || selectedAirport.name} ({selectedAirport.code})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search by city, airport name, or code..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Searching airports...</span>
              </div>
            ) : searchTerm.length < 2 ? (
              "Enter at least 2 characters to search..."
            ) : (
              "No airports found."
            )}
          </CommandEmpty>
          <CommandGroup>
            {airports.map((airport) => (
              <CommandItem
                key={airport.code}
                value={airport.code}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === airport.code ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    <span>
                      {airport.city || airport.name} ({airport.code})
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {airport.name}{airport.city && `, ${airport.city}`}, {airport.country}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}