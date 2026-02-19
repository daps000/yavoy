import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface LocationAutocompleteProps {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function LocationAutocomplete({
  id,
  placeholder,
  value,
  onChange,
  className = "",
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
          const response = await fetch(`/api/locations?q=${encodeURIComponent(value)}`);
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      
      const debounceTimer = setTimeout(fetchSuggestions, 200);
      setIsOpen(true);
      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setIsLoadingLocation(true);
    setIsOpen(false);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "es",
            "User-Agent": "YaVoy-RuralRideshare/1.0 (contact@yavoy.info)",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 429) {
          throw new Error("Servicio de ubicación temporalmente no disponible");
        }
        throw new Error("Error al obtener ubicación");
      }

      const data = await response.json();
      const address = data.address;
      
      const locationName =
        address.village ||
        address.town ||
        address.city ||
        address.municipality ||
        address.county ||
        "Ubicación desconocida";

      onChange(locationName);
    } catch (error) {
      console.error("Error getting location:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      if (errorMessage.includes("temporalmente")) {
        alert(errorMessage);
      } else {
        alert("No se pudo obtener tu ubicación. Asegúrate de permitir el acceso.");
      }
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSelect = (location: string) => {
    onChange(location);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex === 0) {
        handleUseCurrentLocation();
      } else if (highlightedIndex > 0 && suggestions[highlightedIndex - 1]) {
        handleSelect(suggestions[highlightedIndex - 1]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Hide dropdown if 5+ chars typed and no suggestions found (let user proceed with custom text)
  const hasNoResults = !isLoadingSuggestions && suggestions.length === 0 && value.length >= 5;
  const showDropdown = isOpen && value.length >= 2 && !hasNoResults;

  return (
    <div ref={containerRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
      <Input
        ref={inputRef}
        id={id}
        placeholder={placeholder}
        className={`pl-9 border-border bg-card ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        data-testid={`input-${id}`}
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
          <button
            type="button"
            className={`w-full px-3 py-3 flex items-center gap-3 text-left transition-colors ${
              highlightedIndex === 0 ? "bg-primary/10" : "hover:bg-muted"
            }`}
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            data-testid="button-use-location"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            ) : (
              <Navigation className="h-4 w-4 text-primary" />
            )}
            <span className="font-medium text-primary">
              {isLoadingLocation ? "Obteniendo ubicación..." : "Utilizar ubicación actual"}
            </span>
          </button>
          
          {isLoadingSuggestions && (
            <div className="px-3 py-2.5 text-muted-foreground text-sm border-t border-border flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Buscando...
            </div>
          )}
          
          {!isLoadingSuggestions && suggestions.length > 0 && (
            <>
              <div className="border-t border-border" />
              {suggestions.map((location, index) => (
                <button
                  key={location}
                  type="button"
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                    highlightedIndex === index + 1 ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                  onClick={() => handleSelect(location)}
                  data-testid={`suggestion-${index}`}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{location}</span>
                </button>
              ))}
            </>
          )}
          
          {!isLoadingSuggestions && suggestions.length === 0 && value.length >= 2 && (
            <div className="px-3 py-2.5 text-muted-foreground text-sm border-t border-border">
              Escribe el nombre de tu pueblo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
