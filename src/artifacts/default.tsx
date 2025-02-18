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

// Update the NewClothingItem type to not have a default generic parameter
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
  // Move the newItem state inside the component
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

  // Rest of the component state declarations
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

  useEffect(() => {
    const fetchLocation = async () => {
      // First try browser geolocation
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false, // Change to false to speed up response
              timeout: 10000, // Increase timeout to 10 seconds
              maximumAge: 300000 // Allow cached positions up to 5 minutes old
            });
          });

          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: 'Your Location' // We'll use generic name since reverse geocoding requires additional API
          });
          return;
        } catch (error) {
          console.log('Using fallback location');
        }
      }

      // Simplified fallback
      setLocation({
        latitude: 40.71,
        longitude: -74.01,
        city: 'New York (Default)'
      });
    };

    fetchLocation();
  }, []);

  // Weather fetch with proper cleanup
  useEffect(() => {
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
  }, [location]);

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
            <ColorPicker
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
  const ColorPicker = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const [sliderValue, setSliderValue] = useState(0);
    const [showSwatches, setShowSwatches] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const hue = parseInt(e.target.value);
      setSliderValue(hue);
      const hex = `hsl(${hue}, 100%, 50%)`;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = hex;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const closestNamedColor = findClosestColor(hexColor);
        onChange(closestNamedColor);
      }
    };
  
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="range"
              min="0"
              max="360"
              value={sliderValue}
              className="w-full h-8 rounded-lg appearance-none cursor-pointer 
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:border 
                [&::-webkit-slider-thumb]:border-gray-300 
                [&::-webkit-slider-thumb]:cursor-pointer 
                [&::-webkit-slider-thumb]:opacity-0
                [&::-webkit-slider-thumb]:hover:opacity-100
                [&:active::-webkit-slider-thumb]:opacity-100
                [&::-moz-range-thumb]:appearance-none 
                [&::-moz-range-thumb]:w-4 
                [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border 
                [&::-moz-range-thumb]:border-gray-300 
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:opacity-0
                [&::-moz-range-thumb]:hover:opacity-100
                [&:active::-moz-range-thumb]:opacity-100"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, 100%, 50%),
                  hsl(60, 100%, 50%),
                  hsl(120, 100%, 50%),
                  hsl(180, 100%, 50%),
                  hsl(240, 100%, 50%),
                  hsl(300, 100%, 50%),
                  hsl(360, 100%, 50%)
                )`,
              }}
              onChange={handleChange}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full border border-gray-200" 
              style={{ backgroundColor: colorPalette[value as keyof typeof colorPalette] }} 
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSwatches(!showSwatches)}
            >
              {showSwatches ? "Hide" : "More Colors"}
            </Button>
          </div>
        </div>
        
        {showSwatches && (
          <div className="p-2 mt-2 border rounded-lg bg-white shadow-lg">
            <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto">
              {Object.entries(colorPalette).map(([colorName, hexValue]) => (
                <button
                  key={colorName}
                  className={`p-1 rounded-lg border ${value === colorName ? 'border-blue-500' : 'border-gray-200'}`}
                  onClick={() => {
                    onChange(colorName);
                    setShowSwatches(false);
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-200" 
                      style={{ backgroundColor: hexValue }} 
                    />
                    <span className="text-xs truncate w-full text-center">
                      {colorName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add StyleSelect component definition
  const StyleSelect = ({ 
    value, 
    onChange, 
    type, 
    subCategory 
  }: { 
    value: StyleTag;
    onChange: (value: StyleTag) => void;
    type: ClothingCategory;
    subCategory: ClothingSubCategory[typeof type];
  }) => {
    const availableStyles = getCategoryStyles(type, subCategory);

    return (
      <Select 
        value={value}
        onValueChange={(newValue: string) => onChange(newValue as StyleTag)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select style" />
        </SelectTrigger>
        <SelectContent>
          <div className="max-h-[200px] overflow-y-auto">
            {availableStyles.map((style) => (
              <SelectItem key={style} value={style}>
                {style.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
            {loading ? (
              <p>Loading weather data...</p>
            ) : (
              <>
                {weather.condition === 'clear' && <Sun className="h-8 w-8" />}
                {weather.condition === 'cloudy' && <Cloud className="h-8 w-8" />}
                {weather.condition === 'rainy' && <CloudRain className="h-8 w-8" />}
                <div>
                  <p className="text-lg">{weather.temp}°F</p>
                  <p className="capitalize">{weather.condition}</p>
                  {location && <p className="text-sm text-gray-500">{location.city}</p>}
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
                <ColorPicker
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
    </div>
  );
};

export default WeatherWardrobe;