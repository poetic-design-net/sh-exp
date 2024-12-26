'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { searchOrders } from "@/app/actions/search-orders";

type OrderSearchProps = {
  onSearch: (term: string) => void;
};

export function OrderSearch({ onSearch }: OrderSearchProps) {
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ label: string; value: string }>>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search for suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const searchTerm = inputValue.toLowerCase();
        
        // Fetch orders with search term
        const matchedOrders = await searchOrders(searchTerm);

        // Create suggestions from matched orders
        const newSuggestions = matchedOrders
          .map(order => {
            const matches = [];
            if (order.customerName?.toLowerCase().includes(searchTerm)) {
              matches.push({ label: `Kunde: ${order.customerName}`, value: order.customerName });
            }
            if (order.customerEmail?.toLowerCase().includes(searchTerm)) {
              matches.push({ label: `Email: ${order.customerEmail}`, value: order.customerEmail });
            }
            if (order.orderNumber?.toString().includes(searchTerm)) {
              matches.push({ label: `Bestellung: #${order.orderNumber}`, value: order.orderNumber.toString() });
            }
            if (order.id?.toLowerCase().includes(searchTerm)) {
              matches.push({ label: `ID: ${order.id}`, value: order.id });
            }
            return matches;
          })
          .flat()
          .filter((suggestion, index, self) => 
            index === self.findIndex((s) => s.value === suggestion.value)
          );

        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue]);

  const handleSelect = (value: string) => {
    setInputValue(value);
    onSearch(value);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue) {
      onSearch(inputValue);
      setShowSuggestions(false);
    }
  };

  const handleReset = () => {
    setInputValue('');
    onSearch('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Suche</Label>
        {inputValue && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Filter zurücksetzen
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nach Kunde oder Bestellnummer suchen..."
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
            className="pl-8"
          />
        </div>
        
        {/* Simple suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-popover shadow-md">
            <div className="py-1">
              {loading ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  Suche...
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(suggestion.value)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {suggestion.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
