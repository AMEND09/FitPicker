import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Sun, Cloud, CloudRain, Shirt, Wind, Footprints, Watch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Icon } from 'lucide-react';
import { trousers } from '@lucide/lab';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'one-piece'
  | 'undergarments'
  | 'footwear'
  | 'accessories';

// Create subcategory type mapping
type SubcategoryMapping = {
  tops: Record<'tshirts' | 'collared' | 'sweaters' | 'outerwear', StyleTag[]>;
  bottoms: Record<'casual' | 'formal' | 'athletic' | 'denim' | 'specialty' | 'shorts', StyleTag[]>;
  'one-piece': Record<'dresses' | 'rompers' | 'overalls', StyleTag[]>;
  undergarments: Record<'mens-underwear' | 'womens-underwear' | 'sleepwear' | 'shapewear', StyleTag[]>;
  footwear: Record<'sneakers' | 'dress' | 'boots' | 'sandals' | 'slippers', StyleTag[]>;
  accessories: Record<'neckwear' | 'headwear' | 'handwear' | 'belts' | 'eyewear', StyleTag[]>;
};

// Update ClothingSubCategory type to use SubcategoryMapping
type ClothingSubCategory = {
  [K in keyof SubcategoryMapping]: keyof SubcategoryMapping[K];
};

// Update StyleTag to be a proper union type
type StyleTag = 
  // T-Shirts
  | 'crew-neck' | 'v-neck' | 'henley' | 'graphic-tee' | 'pocket-tee' | 'muscle-tee' | 'long-sleeve-tee'
  // Collared Shirts
  | 'polo' | 'dress-shirt' | 'oxford' | 'button-down' | 'hawaiian' | 'cuban-collar' | 'flannel' | 'chambray' | 'linen'
  // Sweaters & Sweatshirts
  | 'pullover' | 'cardigan' | 'crewneck' | 'hoodie' | 'turtleneck' | 'quarter-zip'
  // Jackets & Outerwear
  | 'denim-jacket' | 'leather-jacket' | 'bomber' | 'trench-coat' | 'pea-coat' | 'parka' | 'windbreaker' | 'puffer' | 'blazer' | 'overcoat'
  // Casual Pants
  | 'cargo' | 'chinos' | 'joggers' | 'khakis' | 'corduroy'
  // Allow other strings for future additions
  | string;

// Update clothingCategories with all required properties
const clothingCategories: {
  [K in ClothingCategory]: SubcategoryMapping[K];
} = {
  tops: {
    tshirts: ['crew-neck', 'v-neck', 'henley', 'graphic-tee', 'pocket-tee', 'muscle-tee', 'long-sleeve-tee'],
    collared: ['polo', 'dress-shirt', 'oxford', 'button-down', 'hawaiian', 'cuban-collar', 'flannel', 'chambray', 'linen'],
    sweaters: ['pullover', 'cardigan', 'crewneck', 'hoodie', 'turtleneck', 'quarter-zip'],
    outerwear: ['denim-jacket', 'leather-jacket', 'bomber', 'trench-coat', 'pea-coat', 'parka', 'windbreaker', 'puffer', 'blazer', 'overcoat']
  },
  bottoms: {
    casual: ['cargo', 'chinos', 'joggers', 'khakis', 'corduroy'],
    formal: ['dress-pants', 'suit-trousers', 'slacks', 'wool-trousers'],
    athletic: ['track-pants', 'yoga-pants', 'sweatpants', 'leggings', 'compression-tights'],
    denim: ['straight-leg-jeans', 'skinny-jeans', 'bootcut-jeans', 'slim-fit-jeans', 'wide-leg-jeans'],
    specialty: ['golf-pants', 'snow-pants', 'overalls', 'motorcycle-pants'],
    shorts: ['cargo-shorts', 'chino-shorts', 'bermuda-shorts', 'board-shorts', 'running-shorts', 'biker-shorts', 'denim-shorts']
  },
  'one-piece': {
    dresses: ['maxi-dress', 'midi-dress', 'mini-dress', 'wrap-dress', 'shirt-dress'],
    rompers: ['casual-romper', 'dressy-romper'],
    overalls: ['denim-overalls', 'work-overalls']
  },
  undergarments: {
    'mens-underwear': ['boxers', 'briefs', 'boxer-briefs'],
    'womens-underwear': ['bikini', 'hipster', 'boyshort'],
    sleepwear: ['pajamas', 'nightgown', 'robe'],
    shapewear: ['camisole', 'slip', 'thermal']
  },
  footwear: {
    sneakers: ['athletic', 'casual', 'high-top'],
    dress: ['oxford', 'loafer', 'pump'],
    boots: ['chelsea', 'combat', 'hiking'],
    sandals: ['flip-flop', 'slide', 'sport'],
    slippers: ['moccasin', 'scuff', 'boot']
  },
  accessories: {
    neckwear: ['tie', 'bow-tie', 'scarf'],
    headwear: ['baseball-cap', 'beanie', 'fedora'],
    handwear: ['gloves', 'mittens'],
    belts: ['leather', 'canvas', 'elastic'],
    eyewear: ['sunglasses', 'reading']
  }
} as const;

interface ClothingItem {
  id: number;
  name: string;
  type: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessories';
  imageUrl: string;
  color: string;
  weatherTags: ('hot' | 'mild' | 'cold' | 'rainy')[];
  styleTag: StyleTag;
  category: ClothingCategory;
  subCategory: ClothingSubCategory[ClothingCategory];
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    precipitation: number;
  };
}

interface LocationResponse {
  latitude: number;
  longitude: number;
  city: string;
}

interface OutfitHistory {
  date: string;
  items: number[];  // Array of clothing item IDs
}

interface ColorPreference {
  color1: string;
  color2: string;
  score: number;  // Range from -1 to 1, where 1 is strongly liked, -1 is strongly disliked
}

interface OutfitFeedback {
  outfit: ClothingItem[];
  liked: boolean;
  date: string;
}

interface StylePreference {
  style1: StyleTag;
  style2: StyleTag;
  score: number;  // Range from -1 to 1
}

type WeatherTag = 'hot' | 'mild' | 'cold' | 'rainy';

// Updated color definitions
const colorPalette = {
  black: '#000000',
  'dark-gray': '#444444',
  gray: '#808080',
  'light-gray': '#CCCCCC',
  white: '#FFFFFF',
  'dark-navy': '#000080',
  navy: '#0000FF',
  'light-navy': '#4040FF',
  'dark-red': '#800000',
  red: '#FF0000',
  'light-red': '#FF4040',
  'dark-blue': '#000080',
  blue: '#0000FF',
  'light-blue': '#4040FF',
  'dark-green': '#008000',
  green: '#00FF00',
  'light-green': '#40FF40',
  'dark-beige': '#C4A484',
  beige: '#F5F5DC',
  'light-beige': '#FFFFE0',
  'dark-brown': '#654321',
  brown: '#964B00',
  'light-brown': '#B87333',
} as const;

// Color combination rules updated to include new colors
const colorCombos: { [key: string]: string[] } = {
  black: ['white', 'gray', 'light-gray', 'red', 'light-red', 'blue', 'light-blue', 'green', 'light-green', 'beige', 'light-beige', 'navy', 'light-navy'],
  'dark-gray': ['white', 'light-gray', 'light-red', 'light-blue', 'light-green', 'light-beige', 'light-navy'],
  gray: ['black', 'white', 'navy', 'blue', 'red'],
  'light-gray': ['black', 'dark-gray', 'dark-navy', 'dark-blue', 'dark-red'],
  white: ['black', 'dark-gray', 'navy', 'dark-navy', 'red', 'dark-red', 'blue', 'dark-blue', 'gray'],
  'dark-navy': ['white', 'light-gray', 'light-beige', 'light-red'],
  navy: ['white', 'gray', 'beige', 'red'],
  'light-navy': ['black', 'dark-gray', 'dark-beige'],
  'dark-beige': ['black', 'dark-navy', 'dark-brown', 'white'],
  beige: ['black', 'navy', 'brown', 'white'],
  'light-beige': ['dark-navy', 'dark-brown', 'dark-gray'],
  'dark-brown': ['light-beige', 'white', 'light-blue'],
  brown: ['beige', 'white', 'blue'],
  'light-brown': ['dark-blue', 'dark-gray', 'black'],
  // ... add similar patterns for other colors
};

// Helper function to find closest color
const findClosestColor = (hex: string): keyof typeof colorPalette => {
  let closestColor = Object.entries(colorPalette)[0][0] as keyof typeof colorPalette;
  let closestDistance = Number.MAX_VALUE;

  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  Object.entries(colorPalette).forEach(([colorName, colorHex]) => {
    const r2 = parseInt(colorHex.slice(1, 3), 16);
    const g2 = parseInt(colorHex.slice(3, 5), 16);
    const b2 = parseInt(colorHex.slice(5, 7), 16);

    // Calculate color distance using simple Euclidean distance
    const distance = Math.sqrt(
      Math.pow(r - r2, 2) + 
      Math.pow(g - g2, 2) + 
      Math.pow(b - b2, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestColor = colorName as keyof typeof colorPalette;
    }
  });

  return closestColor;
};

const availableColors = Object.keys(colorCombos);

const clothingTypeStyles: Record<string, StyleTag[]> = {
  top: ['tshirt', 'polo', 'dress-shirt', 'sweater'],
  bottom: ['cargo', 'denim', 'chino', 'shorts'],
  outerwear: ['hoodie', 'quarterzip', 'blazer'],
  shoes: ['sneakers', 'boots', 'dress-shoes', 'sandals'],
  accessories: [] // No specific styles for accessories
};

// Create a type for the subcategory values
type SubcategoryValue<T extends ClothingCategory> = ClothingSubCategory[T];

// Helper function to safely get styles for a category/subcategory combination
function getCategoryStyles<T extends ClothingCategory>(
  category: T,
  subcategory: ClothingSubCategory[T]
): StyleTag[] {
  // Type assertion to help TypeScript understand the structure
  return (clothingCategories[category] as Record<ClothingSubCategory[T], StyleTag[]>)[subcategory];
}

// Move this type definition outside (it's not a hook)
type NewClothingItem<T extends ClothingCategory> = {
  name: string;
  type: 'top';
  imageUrl: string;
  color: string;
  weatherTags: WeatherTag[];
  styleTag: StyleTag;
  category: T;
  subCategory: ClothingSubCategory[T];
}

const WeatherWardrobe = () => {
  // Remove duplicate newItem state declaration and keep only this one
  const [newItem, setNewItem] = useState<NewClothingItem<ClothingCategory>>({
    name: '',
    type: 'top',
    imageUrl: '',
    color: 'black',
    weatherTags: [],
    styleTag: 'tshirt',
    category: 'tops',
    subCategory: 'tshirts'
  });

  // Add new state for managing dropdown open states
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<{temp: number, condition: string}>({ 
    temp: 68, // Changed from 20 to a more reasonable default
    condition: 'clear' 
  });
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationResponse | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitHistory[]>(() => {
    const saved = localStorage.getItem('wardrobe-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [colorPreferences, setColorPreferences] = useState<ColorPreference[]>(() => {
    const saved = localStorage.getItem('color-preferences');
    if (saved) return JSON.parse(saved);
    
    // Initialize with neutral scores for all color combinations
    const initial: ColorPreference[] = [];
    availableColors.forEach(color1 => {
      availableColors.forEach(color2 => {
        if (color1 !== color2) {
          initial.push({ color1, color2, score: 0 });
        }
      });
    });
    return initial;
  });

  const [outfitFeedback, setOutfitFeedback] = useState<OutfitFeedback[]>(() => {
    const saved = localStorage.getItem('outfit-feedback');
    return saved ? JSON.parse(saved) : [];
  });

  const [stylePreferences, setStylePreferences] = useState<StylePreference[]>(() => {
    const saved = localStorage.getItem('style-preferences');
    if (saved) return JSON.parse(saved);
    
    // Initialize with neutral scores for relevant style combinations
    const initial: StylePreference[] = [];
    const topStyles: StyleTag[] = ['hoodie', 'quarterzip', 'flannel', 'tshirt', 'polo', 'dress-shirt', 'sweater', 'blazer'];
    const bottomStyles: StyleTag[] = ['cargo', 'denim', 'chino', 'shorts'];
    
    topStyles.forEach(style1 => {
      bottomStyles.forEach(style2 => {
        initial.push({ style1, style2, score: 0 });
      });
    });
    return initial;
  });

  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);

  // Remove the state for search
  const [wardrobeSearch, setWardrobeSearch] = useState('');

  // Define inputRef
  const inputRef = useRef<HTMLInputElement>(null);

  // Save outfit history to localStorage
  useEffect(() => {
    localStorage.setItem('wardrobe-history', JSON.stringify(outfitHistory));
  }, [outfitHistory]);

  // Load clothes from localStorage
  useEffect(() => {
    const savedClothes = localStorage.getItem('wardrobe-clothes');
    const savedHistory = localStorage.getItem('wardrobe-history');
    
    if (savedClothes) {
      try {
        setClothes(JSON.parse(savedClothes));
      } catch (e) {
        console.error('Failed to parse saved clothes:', e);
        setClothes([]);
      }
    }

    if (savedHistory) {
      try {
        setOutfitHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved history:', e);
        setOutfitHistory([]);
      }
    }
  }, []);

  // Save data with debouncing
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem('wardrobe-clothes', JSON.stringify(clothes));
        localStorage.setItem('wardrobe-history', JSON.stringify(outfitHistory));
        localStorage.setItem('color-preferences', JSON.stringify(colorPreferences));
        localStorage.setItem('outfit-feedback', JSON.stringify(outfitFeedback));
        localStorage.setItem('style-preferences', JSON.stringify(stylePreferences));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [clothes, outfitHistory, colorPreferences, outfitFeedback, stylePreferences]);

  const getClothingIcon = (type: string) => {
    switch(type) {
      case 'top': return <Shirt className="h-5 w-5" />;
      case 'bottom': return <Icon iconNode={trousers} className="h-5 w-5" />; // Changed from icon to iconNode
      case 'outerwear': return <Wind className="h-5 w-5" />;
      case 'shoes': return <Footprints className="h-5 w-5" />;
      case 'accessories': return <Watch className="h-5 w-5" />;
      default: return null;
    }
  };

  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    city: '',
    latitude: '',
    longitude: ''
  });

  // Add helper function for input validation
  const isValidCoordinate = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && Math.abs(num) <= 180;
  };

  // Add manual location dialog component
  const LocationDialog = () => (
    <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Location Manually</DialogTitle>
          <DialogDescription>
            Please enter your city name and coordinates
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="city" className="text-right">City</label>
            <Input
              id="city"
              value={manualLocation.city}
              onChange={(e) => setManualLocation(prev => ({...prev, city: e.target.value}))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="latitude" className="text-right">Latitude</label>
            <Input
              id="latitude"
              value={manualLocation.latitude}
              onChange={(e) => setManualLocation(prev => ({...prev, latitude: e.target.value}))}
              placeholder="-90 to 90"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="longitude" className="text-right">Longitude</label>
            <Input
              id="longitude"
              value={manualLocation.longitude}
              onChange={(e) => setManualLocation(prev => ({...prev, longitude: e.target.value}))}
              placeholder="-180 to 180"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowLocationDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!manualLocation.city ||
                  !isValidCoordinate(manualLocation.latitude) ||
                  !isValidCoordinate(manualLocation.longitude)) {
                alert('Please enter valid location information');
                return;
              }
              
              setLocation({
                city: manualLocation.city,
                latitude: parseFloat(manualLocation.latitude),
                longitude: parseFloat(manualLocation.longitude)
              });
              setShowLocationDialog(false);
            }}
          >
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const [locationFetchFailed, setLocationFetchFailed] = useState(false);
  const [isManualLocationOpen, setIsManualLocationOpen] = useState(false);

  const [showWeatherDialog, setShowWeatherDialog] = useState(false);
  const [manualWeather, setManualWeather] = useState({
    temp: 70,
    condition: 'clear'
  });

  // Add the WeatherDialog component
  const WeatherDialog = () => (
    <Dialog open={showWeatherDialog} onOpenChange={setShowWeatherDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How's the weather?</DialogTitle>
          <DialogDescription>
            Select the current weather conditions
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Temperature</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Cold', desc: 'Below 60°F', temp: 55, icon: <Cloud className="h-4 w-4" /> },
                { label: 'Mild', desc: '60-75°F', temp: 70, icon: <Sun className="h-4 w-4" /> },
                { label: 'Hot', desc: 'Above 75°F', temp: 85, icon: <Sun className="h-4 w-4 text-orange-500" /> }
              ].map((option) => (
                <Button
                  key={option.temp}
                  variant={manualWeather.temp === option.temp ? "default" : "outline"}
                  onClick={() => setManualWeather(prev => ({ ...prev, temp: option.temp }))}
                  className="flex flex-col items-center gap-1 h-auto py-4"
                >
                  {option.icon}
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.desc}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Conditions</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Clear', value: 'clear', icon: <Sun className="h-4 w-4" /> },
                { label: 'Cloudy', value: 'cloudy', icon: <Cloud className="h-4 w-4" /> },
                { label: 'Rainy', value: 'rainy', icon: <CloudRain className="h-4 w-4" /> }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={manualWeather.condition === option.value ? "default" : "outline"}
                  onClick={() => setManualWeather(prev => ({ ...prev, condition: option.value }))}
                  className="flex flex-col items-center gap-1 h-auto py-4"
                >
                  {option.icon}
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              setWeather(manualWeather);
              setManualWeatherOverride(true); // Set override when manually setting weather
              setShowWeatherDialog(false);
            }}
          >
            Save Weather
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Add this helper near other utility functions
  const isMobileBrowser = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Update the fetchLocation function inside useEffect
  useEffect(() => {
    const fetchLocation = async () => {
      if (locationFetchFailed) return;

      try {
        const response = await fetch('http://ip-api.com/json/');
        if (!response.ok) throw new Error('Failed to fetch location data');
        
        const data = await response.json();
        if (data.status === 'success') {
          setLocation({
            latitude: data.lat,
            longitude: data.lon,
            city: data.city || 'Unknown Location'
          });
          return;
        }
        throw new Error('Invalid location data');
      } catch (error) {
        console.error('IP location failed:', error);
        // Only try geolocation as fallback if IP API fails
        try {
          if ('geolocation' in navigator) {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              const geoOptions = {
                enableHighAccuracy: true,
                timeout: isMobileBrowser() ? 20000 : 5000,
                maximumAge: 0,
              };

              if (isMobileBrowser()) {
                alert("Please allow location access to get weather-appropriate outfit suggestions.");
              }

              navigator.geolocation.getCurrentPosition(resolve, reject, geoOptions);
            });

            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: 'Current Location'
            });
            return;
          }
        } catch (geoError) {
          console.log('Geolocation fallback failed:', geoError);
        }
        
        setLocationFetchFailed(true);
        setShowWeatherDialog(true);
      }
    };

    fetchLocation();
  }, []);

  // Add state for manual weather override
  const [manualWeatherOverride, setManualWeatherOverride] = useState<boolean>(false);

  // Modify weather fetch effect to respect manual override
  useEffect(() => {
    if (manualWeatherOverride) return; // Skip weather fetch if manually set

    let isMounted = true;
    const controller = new AbortController();
    let intervalId: number | undefined;

    const fetchWeather = async () => {
      if (!location) return;
      
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,precipitation&temperature_unit=fahrenheit`,
          { signal: controller.signal }
        );
        
        if (!isMounted) return;
        if (!response.ok) {
          throw new Error('Weather API response not ok');
        }

        const data = await response.json();
        
        // Add null check for data.current
        if (!data?.current?.temperature_2m) {
          throw new Error('Invalid weather data format');
        }

        let condition = 'clear';
        if (data.current.precipitation > 0) {
          condition = 'rainy';
        } else if (data.current.temperature_2m > 77) {
          condition = 'cloudy';
        }

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          condition
        });
      } catch (error) {
        if (!isMounted) return;
        console.error('Weather fetch error:', error);
        // Use more reasonable fallback values based on season
        const month = new Date().getMonth();
        const isWinter = month <= 1 || month >= 11;
        const isSummer = month >= 5 && month <= 8;
        setWeather({ 
          temp: isWinter ? 45 : isSummer ? 75 : 65,
          condition: 'clear'
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (location) {
      fetchWeather();
      intervalId = window.setInterval(fetchWeather, 30 * 60 * 1000);
    }

    return () => {
      isMounted = false;
      controller.abort();
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [location, manualWeatherOverride]); // Add manualWeatherOverride to dependencies

  // Memoized handlers
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewItem(prev => ({
        ...prev,
        imageUrl: reader.result as string
      }));
    };
    reader.onerror = () => {
      console.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  }, []);

  // Type-safe add item handler
  const addClothingItem = useCallback(() => {
    if (!newItem.name || newItem.weatherTags.length === 0) {
      alert('Please add a name and at least one weather tag');
      return;
    }
    
    setClothes(prev => [...prev, {
      id: Date.now(),
      name: newItem.name,
      type: newItem.type,
      imageUrl: newItem.imageUrl,
      color: newItem.color,
      weatherTags: newItem.weatherTags,
      styleTag: newItem.styleTag,
      category: newItem.category,
      subCategory: newItem.subCategory
    }]);

    setNewItem({
      name: '',
      type: 'top',
      imageUrl: '',
      color: 'black',
      weatherTags: [],
      styleTag: 'tshirt',
      category: 'tops',
      subCategory: 'tshirts'
    });
  }, [newItem]);

  const isColorCompatible = (color1: string, color2: string): boolean => {
    // If either color is missing, consider them compatible
    if (!color1 || !color2) return true;
    return colorCombos[color1]?.includes(color2) || colorCombos[color2]?.includes(color1);
  };

  const hasBeenWornRecently = (itemId: number, type: string): boolean => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    return outfitHistory
      .filter(hist => new Date(hist.date) > lastWeek)
      .some(hist => {
        // For tops, check if the exact item was worn
        if (type === 'top') {
          return hist.items.includes(itemId);
        }
        // For other items, allow repetition
        return false;
      });
  };

  const getColorPreferenceScore = (color1: string, color2: string): number => {
    const pref = colorPreferences.find(
      p => (p.color1 === color1 && p.color2 === color2) || 
           (p.color1 === color2 && p.color2 === color1)
    );
    return pref?.score || 0;
  };

  const updateColorPreference = (color1: string, color2: string, liked: boolean) => {
    setColorPreferences(prev => {
      const updated = [...prev];
      const prefIndex = updated.findIndex(
        p => (p.color1 === color1 && p.color2 === color2) || 
             (p.color1 === color2 && p.color2 === color1)
      );

      if (prefIndex >= 0) {
        // Adjust score: liked=+0.1, disliked=-0.1, clamped between -1 and 1
        const newScore = Math.min(1, Math.max(-1, 
          updated[prefIndex].score + (liked ? 0.1 : -0.1)
        ));
        updated[prefIndex].score = newScore;
      }

      return updated;
    });
  };

  const getStylePreferenceScore = (style1: StyleTag, style2: StyleTag): number => {
    const pref = stylePreferences.find(
      p => (p.style1 === style1 && p.style2 === style2) || 
           (p.style1 === style2 && p.style2 === style1)
    );
    return pref?.score || 0;
  };

  const updateStylePreference = (style1: StyleTag, style2: StyleTag, liked: boolean) => {
    setStylePreferences(prev => {
      const updated = [...prev];
      const prefIndex = updated.findIndex(
        p => (p.style1 === style1 && p.style2 === style2) || 
             (p.style1 === style2 && p.style2 === style1)
      );

      if (prefIndex >= 0) {
        const newScore = Math.min(1, Math.max(-1, 
          updated[prefIndex].score + (liked ? 0.1 : -0.1)
        ));
        updated[prefIndex].score = newScore;
      }

      return updated;
    });
  };

  // Create a state for regenerating suggestions
  const [shouldRegenerateSuggestions, setShouldRegenerateSuggestions] = useState(true);

  // Add weather feedback state
  const [temperatureFeedback, setTemperatureFeedback] = useState<{[key: number]: 'hot' | 'cold'}>({});

  // Modify handleOutfitFeedback to take a temperature feedback
  const handleOutfitFeedback = useCallback((outfit: ClothingItem[], liked: boolean, tempFeedback?: 'hot' | 'cold') => {
    // Record the feedback
    setOutfitFeedback(prev => [...prev, {
      outfit,
      liked,
      date: new Date().toISOString()
    }]);

    if (tempFeedback) {
      // Record temperature feedback for each item
      outfit.forEach(item => {
        setTemperatureFeedback(prev => ({
          ...prev,
          [item.id]: tempFeedback
        }));
      });
    }

    // Update color preferences for each pair in the outfit
    for (let i = 0; i < outfit.length; i++) {
      for (let j = i + 1; j < outfit.length; j++) {
        updateColorPreference(outfit[i].color, outfit[j].color, liked);
      }
    }

    // Update style preferences for each pair
    const tops = outfit.filter(item => item.type === 'top');
    const bottoms = outfit.filter(item => item.type === 'bottom');
    
    tops.forEach(top => {
      bottoms.forEach(bottom => {
        updateStylePreference(top.styleTag, bottom.styleTag, liked);
      });
    });

    // Only regenerate suggestions if the user didn't like the combo
    if (!liked) {
      setShouldRegenerateSuggestions(true);
    }
  }, [updateColorPreference, updateStylePreference]);

  const updateHistory = useCallback((selectedOutfit: ClothingItem[]) => {
    const historyEntry = {
      date: new Date().toISOString(),
      items: selectedOutfit.map(item => item.id)
    };

    setOutfitHistory(prev => {
      if (prev.some(h => 
        h.date === historyEntry.date && 
        h.items.every((id, i) => id === historyEntry.items[i])
      )) {
        return prev;
      }
      return [...prev, historyEntry];
    });
  }, []);

  const memoizedGetWeatherSuggestions = useCallback(() => {
    let weatherTag: WeatherTag;
    if (weather.temp >= 77) {
      weatherTag = 'hot';
    } else if (weather.temp <= 59) {
      weatherTag = 'cold';
    } else {
      weatherTag = 'mild';
    }
    if (weather.condition === 'rainy') weatherTag = 'rainy';

    // Filter out items that have received temperature feedback opposite to the current weather
    const suitableItems = clothes.filter(item => {
      const hasValidWeatherTag = (
        item.weatherTags.includes(weatherTag) ||
        item.weatherTags.includes('mild') ||
        (weatherTag === 'mild' && (item.weatherTags.includes('hot') || item.weatherTags.includes('cold')))
      );

      const tempFeedback = temperatureFeedback[item.id];
      const isTemperatureSuitable = !tempFeedback || (
        (weatherTag === 'hot' && tempFeedback !== 'hot') ||
        (weatherTag === 'cold' && tempFeedback !== 'cold')
      );

      return hasValidWeatherTag && isTemperatureSuitable;
    });

    // Group items by type, but don't treat outerwear as tops
    const tops = suitableItems.filter(item => item.type === 'top');
    const bottoms = suitableItems.filter(item => item.type === 'bottom');
    const shoes = suitableItems.filter(item => item.type === 'shoes');
    const outerwear = suitableItems.filter(item => item.type === 'outerwear');

    // Only log if there are actual items and in development
    if (process.env.NODE_ENV === 'development' && 
        (tops.length > 0 || bottoms.length > 0 || shoes.length > 0 || outerwear.length > 0)) {
      console.log('Available items:', {
        tops: tops.map(t => t.name),
        bottoms: bottoms.map(b => b.name),
        shoes: shoes.map(s => s.name),
        outerwear: outerwear.map(o => o.name)
      });
    }

    if (!tops.length || !bottoms.length || !shoes.length) {
      return [];
    }

    // Create outfits with scoring
    const outfits: { items: ClothingItem[]; score: number }[] = [];

    tops.forEach(top => {
      bottoms.forEach(bottom => {
        shoes.forEach(shoe => {
          const baseOutfit = [top, bottom, shoe];
          const colorScore = (
            getColorPreferenceScore(top.color, bottom.color) +
            getColorPreferenceScore(top.color, shoe.color) +
            getColorPreferenceScore(bottom.color, shoe.color)
          ) / 3;

          const styleScore = getStylePreferenceScore(top.styleTag, bottom.styleTag);
          
          // Combine color and style scores with equal weight
          const totalScore = (colorScore + styleScore) / 2;

          if (weatherTag === 'cold' || weatherTag === 'rainy') {
            const matchingOuterwear = outerwear
              .find(ow => ow.id !== top.id); // Avoid using same item as top

            if (matchingOuterwear) {
              baseOutfit.push(matchingOuterwear);
            }
          }

          outfits.push({ items: baseOutfit, score: totalScore });
        });
      });
    });

    if (outfits.length === 0) return [];

    const selectedOutfit = outfits
      .sort((a, b) => b.score - a.score)[0].items;

    // Don't update history here - we'll do it after render
    return selectedOutfit;
  }, [clothes, weather, getColorPreferenceScore, getStylePreferenceScore, temperatureFeedback]);

  // Update suggestions logic to maintain suggestions after generation
  const [currentSuggestions, setCurrentSuggestions] = useState<ClothingItem[]>([]);

  // Update suggestions logic to handle initial render without self-reference
  const suggestions = React.useMemo(() => {
    if (shouldRegenerateSuggestions) {
      const newSuggestions = memoizedGetWeatherSuggestions();
      if (newSuggestions.length > 0) {
        setCurrentSuggestions(newSuggestions);
        setShouldRegenerateSuggestions(false);
      }
      return newSuggestions;
    }
    // Return current suggestions if we're not regenerating
    return currentSuggestions;
  }, [memoizedGetWeatherSuggestions, shouldRegenerateSuggestions, currentSuggestions]);

  // Split the suggestions tab render into a separate component
  const SuggestionsContent = React.memo(() => {
    const [showFeedbackOptions, setShowFeedbackOptions] = useState(false);
    
    const handleGenerateSuggestions = () => {
      setShouldRegenerateSuggestions(true);
      setShowFeedbackOptions(false);
    };

    const handleDontLike = () => {
      setShowFeedbackOptions(true);
    };

    const handleTooHot = () => {
      // Remove outerwear and heavier items, then generate new suggestion
      const hotWeatherSuggestions = memoizedGetWeatherSuggestions().filter(item => 
        item.type !== 'outerwear' && 
        !item.weatherTags.includes('cold')
      );

      if (hotWeatherSuggestions.length > 0) {
        setCurrentSuggestions(hotWeatherSuggestions);
        // Update temperature feedback for future suggestions
        hotWeatherSuggestions.forEach(item => {
          setTemperatureFeedback(prev => ({
            ...prev,
            [item.id]: 'hot'
          }));
        });
      } else {
        // If no suitable items found, generate new suggestion
        setShouldRegenerateSuggestions(true);
      }
      setShowFeedbackOptions(false);
    };

    const handleTooCold = () => {
      // Try to add outerwear or generate new warmer suggestion
      const hasOuterwear = suggestions.some(item => item.type === 'outerwear');
      if (!hasOuterwear) {
        const suitableOuterwear = clothes.find(item => 
          item.type === 'outerwear' && 
          item.weatherTags.includes('cold') &&
          !suggestions.some(s => s.id === item.id)
        );

        if (suitableOuterwear) {
          const newSuggestions = [...suggestions, suitableOuterwear];
          setCurrentSuggestions(newSuggestions);
          updateHistory(newSuggestions);
        } else {
          setShouldRegenerateSuggestions(true);
        }
      } else {
        setShouldRegenerateSuggestions(true);
      }

      // Update temperature feedback for future suggestions
      suggestions.forEach(item => {
        setTemperatureFeedback(prev => ({
          ...prev,
          [item.id]: 'cold'
        }));
      });
      setShowFeedbackOptions(false);
    };

    const handleBadCombo = () => {
      // Record the bad combination before generating new one
      handleOutfitFeedback(suggestions, false);
      setShouldRegenerateSuggestions(true);
      setShowFeedbackOptions(false);
    };

    const handleOtherSuggestion = () => {
      setShouldRegenerateSuggestions(true);
    };

    // Only show generate button if we have enough items for a complete outfit
    const hasRequiredItems = clothes.some(item => item.type === 'top') &&
                           clothes.some(item => item.type === 'bottom') &&
                           clothes.some(item => item.type === 'shoes');

    if (!hasRequiredItems) {
      return (
        <div className="col-span-3 text-center py-8">
          <p className="text-gray-500">
            Add at least one top, one bottom, and one pair of shoes to get outfit suggestions!
          </p>
        </div>
      );
    }

    if (suggestions.length === 0) {
      return (
        <div className="col-span-3 text-center py-8">
          <p className="text-gray-500">
            Click the button below to get an outfit suggestion based on the current weather.
          </p>
          <Button 
            onClick={handleGenerateSuggestions}
            className="mt-4"
          >
            Generate Outfit Suggestion
          </Button>
        </div>
      );
    }

    return (
      <>
        {suggestions.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getClothingIcon(item.type)}
                <h3 className="font-bold">{item.name}</h3>
              </div>
            </CardHeader>
            {item.imageUrl && (
              <CardContent>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded"
                />
              </CardContent>
            )}
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm capitalize">{item.type}</p>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="flex gap-1">
                {item.weatherTags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
        <div className="col-span-full flex flex-col items-center gap-4 mt-4">
          {!showFeedbackOptions ? (
            <div className="flex flex-col gap-4 items-center">
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleDontLike}
                >
                  Don't Like This Combo
                </Button>
                <Button 
                  onClick={() => handleOutfitFeedback(suggestions, true)}
                >
                  Like This Combo
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={handleOtherSuggestion}
                className="text-gray-500"
              >
                Show Other Suggestion
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  className="text-red-500"
                  onClick={handleTooHot}
                >
                  Too Hot
                </Button>
                <Button 
                  variant="outline"
                  className="text-blue-500"
                  onClick={handleTooCold}
                >
                  Too Cold
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleBadCombo}
                >
                  Bad Combo
                </Button>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedbackOptions(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </>
    );
  });

  // Move useEffect outside of the memoized component
  React.useEffect(() => {
    if (suggestions.length > 0) {
      updateHistory(suggestions);
    }
  }, [suggestions, updateHistory]);

  const startEditing = (item: ClothingItem) => {
    setEditingItem(item);
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const updateClothingItem = (updatedItem: ClothingItem) => {
    setClothes(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const deleteClothingItem = (item: ClothingItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    // Remove from clothes array
    setClothes(prev => prev.filter(item => item.id !== itemToDelete.id));
    
    // Remove from outfit history
    setOutfitHistory(prev => prev.filter(hist => !hist.items.includes(itemToDelete.id)));
    
    // Remove from outfit feedback
    setOutfitFeedback(prev => prev.filter(feedback => 
      !feedback.outfit.some(item => item.id === itemToDelete.id)
    ));

    // Clean up color preferences if this was the last item of its color
    const remainingItemsWithColor = clothes.filter(item => 
      item.id !== itemToDelete.id && item.color === itemToDelete.color
    );
    
    if (remainingItemsWithColor.length === 0) {
      setColorPreferences(prev => 
        prev.filter(pref => 
          pref.color1 !== itemToDelete.color && 
          pref.color2 !== itemToDelete.color
        )
      );
    }

    setItemToDelete(null);
  };

  // Edit form component
  const EditItemForm = ({ item }: { item: ClothingItem }) => {
    const [editForm, setEditForm] = useState(item);

    const handleEditImage = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    };

    return (
      <Card className="mb-4">
        <CardContent className="space-y-4 p-4">
          <Input
            placeholder="Item name"
            value={editForm.name}
            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium">Image (optional)</p>
            <div className="flex flex-col gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleEditImage}
                className="cursor-pointer"
              />
              {editForm.imageUrl && (
                <div className="relative w-full h-40">
                  <img
                    src={editForm.imageUrl}
                    alt={editForm.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Color</p>
            <ColorSelect
              value={editForm.color}
              onChange={(value) => setEditForm({...editForm, color: value})}
            />
          </div>
          <Select
            value={editForm.category}
            onValueChange={(value) => setEditForm({
              ...editForm,
              category: value as ClothingCategory,
              subCategory: Object.keys(clothingCategories[value as ClothingCategory])[0] as any
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(clothingCategories).map(category => (
                <SelectItem key={category} value={category}>
                  {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {editForm.category && (
            <Select
              value={editForm.subCategory}
              onValueChange={(value) => setEditForm({
                ...editForm,
                subCategory: value as any,
                styleTag: getCategoryStyles(editForm.category, value as any)[0]
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(clothingCategories[editForm.category]).map(subCategory => (
                  <SelectItem key={subCategory} value={subCategory}>
                    {subCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {editForm.subCategory && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Style</p>
              <StyleSelect
                value={editForm.styleTag}
                onChange={(value) => setEditForm({...editForm, styleTag: value as StyleTag})}
                type={editForm.category}
                subCategory={editForm.subCategory}
              />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Weather Tags</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allTags = editForm.weatherTags.length === weatherTags.length 
                    ? []
                    : [...weatherTags];
                  setEditForm({...editForm, weatherTags: allTags});
                }}
              >
                {editForm.weatherTags.length === weatherTags.length ? 'Clear All' : 'All Weather'}
              </Button>
            </div>
            <div className="flex gap-2">
              {weatherTags.map((tag) => (
                <Button
                  key={tag}
                  variant={editForm.weatherTags.includes(tag) ? "default" : "outline"}
                  onClick={() => {
                    const tags = editForm.weatherTags.includes(tag)
                      ? editForm.weatherTags.filter(t => t !== tag)
                      : [...editForm.weatherTags, tag];
                    setEditForm({...editForm, weatherTags: tags});
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={cancelEditing}>Cancel</Button>
            <Button onClick={() => updateClothingItem(editForm)}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const weatherTags: WeatherTag[] = ['hot', 'mild', 'cold', 'rainy'];

  // Move useEffect outside of the memoized component
  React.useEffect(() => {
    if (suggestions.length > 0) {
      updateHistory(suggestions);
    }
  }, [suggestions, updateHistory]);

  // Filter clothes based on search
  const filteredClothes = clothes.filter(item =>
    item.name.toLowerCase().includes(wardrobeSearch.toLowerCase()) ||
    item.type.toLowerCase().includes(wardrobeSearch.toLowerCase()) ||
    item.color.toLowerCase().includes(wardrobeSearch.toLowerCase())
  );

  // Define all style options
  const allStyles: StyleTag[] = [
    'hoodie', 'quarterzip', 'cargo', 'denim', 'flannel', 'tshirt',
    'polo', 'dress-shirt', 'sweater', 'blazer', 'chino', 'shorts',
    'sneakers', 'boots', 'dress-shoes', 'sandals'
  ];

  // Update the Select components to remove search
  const ColorWheel = ({ value, onChange }: { value: string, onChange: (color: string) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDragging] = useState(false);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      // Draw color wheel
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 5;
  
      for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 2) * Math.PI / 180;
        const endAngle = (angle + 2) * Math.PI / 180;
  
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
  
        // Convert from HSL to hex
        const hue = angle;
        const saturation = 100;
        const lightness = 50;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fill();
      }
    }, []);
  
    const handleColorSelect = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      const imageData = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${imageData[0].toString(16).padStart(2, '0')}${imageData[1].toString(16).padStart(2, '0')}${imageData[2].toString(16).padStart(2, '0')}`;
      onChange(hex);
    };
  
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDragging(true);
      handleColorSelect(e);
    };
  
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      handleColorSelect(e);
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
    };
  
    return (
      <canvas
        ref={canvasRef}
        width={200}
        height={200}
        className="cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    );
  };
  
  // Update the ColorSelect component
  const ColorSelect = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const [open, setOpen] = useState(false);
    
    const handleColorChange = (newColor: string) => {
      const closestNamedColor = findClosestColor(newColor);
      onChange(closestNamedColor);
    };
    
    return (
      <Select 
        value={value} 
        onValueChange={onChange}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200" 
                style={{ backgroundColor: colorPalette[value as keyof typeof colorPalette] }} 
              />
              <span className="capitalize">{value.replace('-', ' ')}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-4 flex justify-center">
            <ColorWheel 
              value={colorPalette[value as keyof typeof colorPalette]}
              onChange={handleColorChange}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto border-t">
            {Object.entries(colorPalette).map(([colorName, hexValue]) => (
              <SelectItem key={colorName} value={colorName}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200" 
                    style={{ backgroundColor: hexValue }} 
                  />
                  <span className="capitalize">{colorName.replace('-', ' ')}</span>
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    );
  };

// Update the StyleSelect component with proper typing
const StyleSelect = ({ value, onChange, type, subCategory }: { 
  value: StyleTag;
  onChange: (value: StyleTag) => void;
  type: ClothingCategory;
  subCategory: ClothingSubCategory[typeof type];
}) => {
  const [open, setOpen] = useState(false);
  const availableStyles = getCategoryStyles(type, subCategory);

  return (
    <Select 
      value={value.toString()}
      onValueChange={(value) => onChange(value as StyleTag)}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select style" />
      </SelectTrigger>
      <SelectContent>
        <div className="max-h-[200px] overflow-y-auto">
          {availableStyles.map((style: StyleTag) => (
            <SelectItem key={style.toString()} value={style.toString()}>
              {style.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
};

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Weather Status</h2>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            {loading && !manualWeatherOverride ? (
              <p>Loading weather data...</p>
            ) : (
              <>
                {weather.condition === 'clear' && <Sun className="h-8 w-8" />}
                {weather.condition === 'cloudy' && <Cloud className="h-8 w-8" />}
                {weather.condition === 'rainy' && <CloudRain className="h-8 w-8" />}
                <div>
                  <p className="text-lg">{weather.temp}°F</p>
                  <p className="capitalize">{weather.condition}</p>
                  {location && !manualWeatherOverride && (
                    <p className="text-sm text-gray-500">{location.city}</p>
                  )}
                  {manualWeatherOverride && (
                    <p className="text-sm text-blue-500">Manually Set</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {manualWeatherOverride && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setManualWeatherOverride(false);
                        setShowWeatherDialog(false);
                      }}
                    >
                      Reset to Auto
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWeatherDialog(true)}
                  >
                    Set Weather
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="add">Add Clothes</TabsTrigger>
          <TabsTrigger value="wardrobe">My Wardrobe</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Today's Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SuggestionsContent />
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <h2 className="text-2xl font-bold mb-4">Add New Item</h2>
          <Card>
            <CardContent className="space-y-4 p-4">
              <Input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
              <div className="space-y-2">
                <p className="text-sm font-medium">Image (optional)</p>
                <div className="flex flex-col gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  {newItem.imageUrl && (
                    <div className="relative w-full h-40">
                      <img
                        src={newItem.imageUrl}
                        alt={newItem.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Color</p>
                <ColorSelect
                  value={newItem.color}
                  onChange={(value) => setNewItem({...newItem, color: value})}
                />
              </div>
              <Select
                value={newItem.category}
                onValueChange={(value: ClothingCategory) => {
                  const category = value;
                  const subcategories = Object.keys(clothingCategories[category]) as Array<ClothingSubCategory[typeof category]>;
                  const firstSubcategory = subcategories[0];
                  const styles = getCategoryStyles(category, firstSubcategory);
                  
                  setNewItem({
                    ...newItem,
                    category,
                    subCategory: firstSubcategory,
                    styleTag: styles[0]
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(clothingCategories).map(category => (
                    <SelectItem key={category} value={category}>
                      {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newItem.category && (
                <Select
                  value={newItem.subCategory}
                  onValueChange={(value: SubcategoryValue<typeof newItem.category>) => {
                    const styles = getCategoryStyles(newItem.category, value);
                    // Cast to handle the type transition  
                    setNewItem(prev => ({
                      ...prev,
                      subCategory: value,
                      styleTag: styles[0]
                    }) as NewClothingItem<typeof newItem.category>);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(clothingCategories[newItem.category]).map(subCategory => (
                      <SelectItem key={subCategory} value={subCategory}>
                        {subCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {newItem.subCategory && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Style</p>
                  <StyleSelect
                    value={newItem.styleTag}
                    onChange={(value) => setNewItem({...newItem, styleTag: value as StyleTag})}
                    type={newItem.category}
                    subCategory={newItem.subCategory}
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">Weather Tags</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allTags = newItem.weatherTags.length === weatherTags.length 
                        ? []
                        : [...weatherTags];
                      setNewItem({...newItem, weatherTags: allTags});
                    }}
                  >
                    {newItem.weatherTags.length === weatherTags.length ? 'Clear All' : 'All Weather'}
                  </Button>
                </div>
                <div className="flex gap-2">
                  {weatherTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={newItem.weatherTags.includes(tag) ? "default" : "outline"}
                      onClick={() => {
                        const tags = newItem.weatherTags.includes(tag)
                          ? newItem.weatherTags.filter(t => t !== tag)
                          : [...newItem.weatherTags, tag];
                        setNewItem({...newItem, weatherTags: tags});
                      }}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={addClothingItem}>Add Item</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wardrobe" className="mt-4">
          <h2 className="text-2xl font-bold mb-4">All Clothes</h2>
          <div className="mb-4">
            <Input
              placeholder="Search wardrobe..."
              value={wardrobeSearch}
              onChange={(e) => setWardrobeSearch(e.target.value)}
            />
          </div>
          {editingItem && <EditItemForm item={editingItem} />}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {filteredClothes.length === 0 ? (
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500">
                  {clothes.length === 0 ? "No clothes added yet. Start by adding some items!" : "No matching items found."}
                </p>
              </div>
            ) : (
              filteredClothes.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getClothingIcon(item.type)}
                        <h3 className="font-bold">{item.name}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => startEditing(item)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteClothingItem(item)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {item.imageUrl && (
                    <CardContent>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded"
                      />
                    </CardContent>
                  )}
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm capitalize">{item.type}</p>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                    <div className="flex gap-1">
                      {item.weatherTags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{itemToDelete?.name}" from your wardrobe. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <LocationDialog />
      <WeatherDialog />
    </div>
  );
};

export default WeatherWardrobe;