import React, { useState, useMemo, useCallback } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import usePlacesAutocomplete, { getDetails, getGeocode } from "use-places-autocomplete";

// Utility function to clean up county names
const cleanCountyName = (countyName: string): string => {
  if (!countyName) return "";

  // Remove "Județul " prefix (case insensitive)
  let cleaned = countyName.replace(/^județul\s+/i, "");

  // Remove "County" suffix (case insensitive)
  cleaned = cleaned.replace(/(\s+county|^county)$/i, "");

  // Remove diacritics
  const diacriticsMap: { [key: string]: string } = {
    'ă': 'a', 'Ă': 'A',
    'â': 'a', 'Â': 'A', 
    'î': 'i', 'Î': 'I',
    'ș': 's', 'Ș': 'S',
    'ț': 't', 'Ț': 'T'
  };

  cleaned = cleaned.replace(/[ăâîșțĂÂÎȘȚ]/g, (match) => diacriticsMap[match] || match);

  return cleaned;
};

const mapContainerStyle = { width: "100%", height: "380px", borderRadius: "1rem" };
const defaultCenter = { lat: 44.4268, lng: 26.1025 }; // București

// Static libraries array to prevent LoadScript from reloading
const libraries: ("places")[] = ["places"];

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  onPlaceSelect?: (place: any) => void;
  inputRef?: React.RefObject<{ getValue: () => string }>;
  showMap?: boolean;
  onAddressResolved?: (data: {
    strada: string;
    localitate: string;
    judet: string;
    cod_postal: string;
    lat: number | null;
    lng: number | null;
  }) => void;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = "Tastează strada și numărul...",
  className,
  disabled = false,
  id,
  onPlaceSelect,
  inputRef,
  showMap = false,
  onAddressResolved,
}) => {
  const [form, setForm] = useState({
    strada: value || "",
    localitate: "",
    judet: "",
    cod_postal: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  const center = useMemo(() => {
    return form.lat && form.lng ? { lat: form.lat, lng: form.lng } : defaultCenter;
  }, [form.lat, form.lng]);

  const handleResolved = useCallback((data: any) => {
    setForm((f) => ({ ...f, ...data }));

    // Update the main input value
    if (data.strada) {
      onChange(data.strada);
    }

    // Call the onAddressResolved callback if provided
    if (onAddressResolved) {
      onAddressResolved(data);
    }

    // Call onPlaceSelect if provided (for backward compatibility)
    if (onPlaceSelect) {
      onPlaceSelect(data);
    }
  }, [onChange, onAddressResolved, onPlaceSelect]);

  // Create an interface for external access to the input value
  React.useEffect(() => {
    if (inputRef) {
      inputRef.current = {
        getValue: () => form.strada || value
      };
    }
  }, [inputRef, form.strada, value]);

  // Update form when value prop changes
  React.useEffect(() => {
    if (value !== form.strada) {
      setForm(prev => ({ ...prev, strada: value }));
    }
  }, [value]);

  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyA1B8WNJx5X5S9tqN-hdyiZyrEwOcUpZvM" 
      libraries={libraries}
    >
      <div className={className}>
        <div className="space-y-3">
          <AutocompleteInput 
            onResolved={handleResolved} 
            value={form.strada}
            placeholder={placeholder}
            disabled={disabled}
            id={id}
            onBlur={onBlur}
          />

          {showMap && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  className="border p-2 rounded" 
                  value={form.localitate} 
                  readOnly 
                  placeholder="Localitate" 
                />
                <input 
                  className="border p-2 rounded" 
                  value={form.judet} 
                  readOnly 
                  placeholder="Județ" 
                />
                <input 
                  className="border p-2 rounded col-span-2" 
                  value={form.strada} 
                  readOnly 
                  placeholder="Stradă și nr." 
                />
                <input 
                  className="border p-2 rounded col-span-2" 
                  value={form.cod_postal} 
                  readOnly 
                  placeholder="Cod poștal" 
                />
              </div>

              <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={form.lat ? 16 : 11}>
                {form.lat && form.lng && (
                  <Marker
                    position={{ lat: form.lat, lng: form.lng }}
                    draggable
                    onDragEnd={async (e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();

                      if (lat && lng) {
                        // reverse geocode pentru actualizarea câmpurilor la mutarea pin-ului
                        try {
                          const results = await getGeocode({ location: { lat, lng } });
                          const ac = results?.[0]?.address_components || [];
                          const get = (type: string) => ac.find(c => c.types.includes(type))?.long_name || "";
                          let strada = [get("route"), get("street_number")].filter(Boolean).join(" ");
                          const localitate = get("locality") || get("sublocality") || get("administrative_area_level_2");
                          const judetRaw = get("administrative_area_level_1");
                          const judet = cleanCountyName(judetRaw);
                          const cod_postal = get("postal_code") || "";

                          // If no specific street address is found, default to "principala"
                          if (!strada && localitate) {
                            strada = "principala";
                            console.log(`🗺️ Nu s-a găsit adresă specifică la coordonatele ${lat}, ${lng} pentru ${localitate}, ${judet}. Se folosește "principala" ca adresă implicită.`);
                          }

                          const newData = { strada, localitate, judet, cod_postal, lat, lng };
                          handleResolved(newData);
                        } catch (error) {
                          console.error("Error reverse geocoding:", error);
                        }
                      }
                    }}
                  />
                )}
              </GoogleMap>
            </>
          )}
        </div>
      </div>
    </LoadScript>
  );
};

interface AutocompleteInputProps {
  onResolved: (data: any) => void;
  value: string;
  placeholder: string;
  disabled: boolean;
  id?: string;
  onBlur?: (value: string) => void;
}

function AutocompleteInput({ onResolved, value, placeholder, disabled, id, onBlur }: AutocompleteInputProps) {
  const { ready, value: inputValue, suggestions: { status, data }, setValue, clearSuggestions } =
    usePlacesAutocomplete({
      debounce: 250,
      requestOptions: { componentRestrictions: { country: "ro" } }, // doar RO
    });

  // Sync with external value
  React.useEffect(() => {
    if (value !== inputValue) {
      setValue(value, false);
    }
  }, [value, setValue]);

  const handleSelect = useCallback(async (description: string, place_id: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      // Luăm detalii complete inclusiv coordonate
      const place = await getDetails({
        placeId: place_id,
        fields: ["address_components", "geometry", "formatted_address"]
      });

      const ac = place?.address_components || [];
      const get = (type: string) => ac.find(c => c.types.includes(type))?.long_name || "";

      let strada = [get("route"), get("street_number")].filter(Boolean).join(" ");
      const localitate = get("locality") || get("sublocality") || get("administrative_area_level_2");
      const judetRaw = get("administrative_area_level_1");
      const judet = cleanCountyName(judetRaw);
      const cod_postal = get("postal_code") || "";
      const lat = place?.geometry?.location?.lat();
      const lng = place?.geometry?.location?.lng();

      // If no specific street address is found, default to "principala"
      if (!strada && localitate) {
        strada = "principala";
        console.log(`🏠 Nu s-a găsit adresă specifică pentru ${localitate}, ${judet}. Se folosește "principala" ca adresă implicită.`);
      }

      console.log("🏠 Adresa extrasă din Google Places:", {
        strada,
        localitate,
        judet_original: judetRaw || "Nu s-a găsit județ",
        judet_cleaned: judet || "Nu s-a găsit județ",
        cod_postal,
        lat,
        lng
      });

      onResolved({ strada, localitate, judet, cod_postal, lat, lng });
    } catch (error) {
      console.error("Error getting place details:", error);
    }
  }, [clearSuggestions, onResolved, setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (onBlur) {
      onBlur(inputValue);
    }
  };

  return (
    <div className="relative">
      <input
        value={inputValue}
        disabled={!ready || disabled}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full border p-2 rounded"
        id={id}
      />
      {status === "OK" && (
        <ul className="absolute z-20 w-full bg-white border rounded mt-1 max-h-64 overflow-auto shadow">
          {data.map((s) => (
            <li
              key={s.place_id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(s.description, s.place_id)}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
