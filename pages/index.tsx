import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { AddressMapHandle } from '@/components/AddressMap';
import ComingSoon from '@/components/ComingSoon';

const AddressMap = dynamic(() => import('@/components/AddressMap'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [address, setAddress] = useState({
    country: '',
    city: '',
    postalCode: '',
    street: '',
    houseNumber: '',
    levelDoor: '',
    coordinates: null as { lat: number; lng: number } | null
  });
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);
  const addressMapRef = useRef<AddressMapHandle>(null);

  const validateFiles = (files: File[], type: 'image' | 'video') => {
    const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    const maxCount = type === 'image' ? MAX_IMAGES : MAX_VIDEOS;
    const currentCount = type === 'image' ? selectedImages.length : selectedVideos.length;

    if (files.length + currentCount > maxCount) {
      toast.error(`Maximum ${maxCount} ${type === 'image' ? 'képet' : 'videót'} lehet feltölteni`);
      return false;
    }

    for (const file of files) {
      if (file.size > maxSize) {
        toast.error(`${file.name} túl nagy (maximum ${maxSize / (1024 * 1024)}MB)`);
        return false;
      }
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (!validateFiles(files, type)) {
      e.target.value = ''; // Reset input
      return;
    }

    if (type === 'image') {
      const newImages = [...selectedImages, ...files];
      setSelectedImages(newImages);
      // If this is the first image, set it as main image
      if (selectedImages.length === 0 && files.length > 0) {
        setMainImageIndex(0);
      }
    } else {
      setSelectedVideos(prev => [...prev, ...files]);
    }
  };

  const removeFile = (file: File, type: 'image' | 'video', index: number) => {
    if (!window.confirm(`Biztosan törölni szeretnéd ezt a ${type === 'image' ? 'képet' : 'videót'}?`)) {
      return;
    }

    if (type === 'image') {
      const newImages = selectedImages.filter(f => f !== file);
      setSelectedImages(newImages);
      // Update main image index if needed
      if (mainImageIndex === index) {
        setMainImageIndex(newImages.length > 0 ? 0 : null);
      } else if (mainImageIndex !== null && index < mainImageIndex) {
        setMainImageIndex(mainImageIndex - 1);
      }
    } else {
      setSelectedVideos(prev => prev.filter(f => f !== file));
    }
  };

  const handleMainImageSelect = (index: number) => {
    setMainImageIndex(index);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent any default form submission
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission on Enter
    }
  };

  const handleCoordinatesUpdate = (coordinates: { lat: number; lng: number }) => {
    setIsFetchingCoordinates(false);
    setAddress(prev => ({
      ...prev,
      coordinates
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get form values
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
    const accessCode = (form.elements.namedItem('accessCode') as HTMLInputElement).value.trim();
    const instagram = (form.elements.namedItem('instagram') as HTMLInputElement).value.trim();
    const facebook = (form.elements.namedItem('facebook') as HTMLInputElement).value.trim();
    const tiktok = (form.elements.namedItem('tiktok') as HTMLInputElement).value.trim();
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
    const minPrice = (form.elements.namedItem('minPrice') as HTMLInputElement).value;
    const maxPrice = (form.elements.namedItem('maxPrice') as HTMLInputElement).value;

    // Validate name
    if (name.length < 2) {
      toast.error('A névnek legalább 2 karakternek kell lennie');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Kérjük, adjon meg egy érvényes email címet');
      return;
    }

    // Validate phone (Hungarian format)
    const phoneRegex = /^(\+36|06)[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error('Kérjük, adjon meg egy érvényes magyar telefonszámot (+36 vagy 06 kezdetű)');
      return;
    }

    // Validate access code
    if (accessCode.length !== 8) {
      toast.error('A hozzáférési kódnak pontosan 8 karakternek kell lennie');
      return;
    }

    // Validate social media handles if provided
    if (instagram && !instagram.startsWith('@')) {
      toast.error('Az Instagram felhasználónévnek @ jellel kell kezdődnie');
      return;
    }

    if (facebook && !facebook.includes('facebook.com/')) {
      toast.error('A Facebook linknek tartalmaznia kell a facebook.com/ részt');
      return;
    }

    if (tiktok && !tiktok.startsWith('@')) {
      toast.error('A TikTok felhasználónévnek @ jellel kell kezdődnie');
      return;
    }

    // Validate category
    if (!category) {
      toast.error('Kérjük, válasszon kategóriát');
      return;
    }

    // Validate prices if provided
    if (minPrice && maxPrice && parseInt(maxPrice) <= parseInt(minPrice)) {
      toast.error('A maximális árnak nagyobbnak kell lennie a minimális árnál');
      return;
    }

    // Validate address fields
    if (!address.country) {
      toast.error('Kérjük, adja meg az országot');
      return;
    }

    if (!address.city) {
      toast.error('Kérjük, adja meg a várost');
      return;
    }

    if (!address.postalCode || address.postalCode.length < 4) {
      toast.error('Az irányítószámnak legalább 4 karakternek kell lennie');
      return;
    }

    if (!address.street) {
      toast.error('Kérjük, adja meg az utcát');
      return;
    }

    if (!address.houseNumber) {
      toast.error('Kérjük, adja meg a házszámot');
      return;
    }

    // Validate media uploads
    if (selectedImages.length === 0) {
      toast.error('Kérjük, töltse fel legalább egy képet');
      return;
    }

    if (mainImageIndex === null) {
      toast.error('Kérjük, jelölje ki a fő képet');
      return;
    }

    // If we don't have coordinates, trigger the search
    if (!address.coordinates) {
      if (addressMapRef.current) {
        try {
          await addressMapRef.current.searchAddress();
          // If search was successful and coordinates are now available, continue with submission
          if (address.coordinates) {
            // Continue with form submission
            await submitForm(e);
          } else {
            toast.error('Nem sikerült megtalálni a címet. Kérjük, ellenőrizze a megadott adatokat.');
          }
        } catch (error) {
          toast.error('Hiba történt a cím keresése közben. Kérjük, próbálja újra.');
        }
      }
      return;
    }

    // If we already have coordinates, submit the form
    await submitForm(e);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    // Add coordinates to formData
    formData.append('latitude', address.coordinates!.lat.toString());
    formData.append('longitude', address.coordinates!.lng.toString());
    
    // Add files to formData with main image flag
    selectedImages.forEach((file, index) => {
      formData.append(`images`, file);
      if (index === mainImageIndex) {
        formData.append('mainImageIndex', index.toString());
      }
    });
    selectedVideos.forEach((file, index) => {
      formData.append(`videos`, file);
    });

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Upload failed');
      }

      toast.success('Feltöltés sikeres!');
      if (formRef.current) {
        formRef.current.reset();
      }
      setSelectedImages([]);
      setSelectedVideos([]);
      setUploadProgress({});
      setAddress({
        country: '',
        city: '',
        postalCode: '',
        street: '',
        houseNumber: '',
        levelDoor: '',
        coordinates: null
      });
    } catch (error: any) {
      toast.error(error.message || 'A feltöltés sikertelen. Kérjük, próbáld újra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SOS Beauty Feltöltő Űrlap</h1>
              <p className="text-gray-600 mb-4">Jelentkezd be szépségipari szolgáltatásoddal</p>
              <div className="bg-indigo-50 rounded-lg p-4 inline-block">
                <p className="text-indigo-700 mb-2">
                  Szükséged van hozzáférési kódra a szépségipari szolgáltatásod beküldéséhez?
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Hozzáférési Kód Kérése
                </Link>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Személyes Adatok</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Név
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Üzlet neve vagy a te neved"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="pelda@email.com"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    placeholder="+36 20 123 4567"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700">
                    Hozzáférési Kód
                  </label>
                  <input
                    type="text"
                    name="accessCode"
                    id="accessCode"
                    required
                    placeholder="8 karakteres kód"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    id="instagram"
                    placeholder="@felhasznalonev"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    id="facebook"
                    placeholder="facebook.com/felhasznalonev"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700">
                    TikTok
                  </label>
                  <input
                    type="text"
                    name="tiktok"
                    id="tiktok"
                    placeholder="@felhasznalonev"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Szolgáltatás Adatok</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Kategória
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  >
                    <option value="">Válassz kategóriát</option>
                    <option value="eyelash">Pillás</option>
                    <option value="nails">Körmös</option>
                    <option value="female_hair">Női fodrász</option>
                    <option value="makeup">Sminkes</option>
                    <option value="lip_filler">Szájfeltöltés</option>
                    <option value="male_hair">Férfi fodrász</option>
                    <option value="laser_hair">Lézeres szőrtelenítés</option>
                    <option value="cosmetologist">Kozmetikus</option>
                    <option value="botox">Botox</option>
                    <option value="permanent_makeup">Sminktetoválás</option>
                    <option value="waxing">Gyanta</option>
                    <option value="brow_lash">Szemöldök és szempilla</option>
                    <option value="hair_extension">Hajhosszabbítás</option>
                    <option value="pedicure">Pedikűr</option>
                    <option value="fitness">Fitness/mozgás</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                      Minimális Ár
                    </label>
                    <input
                      type="number"
                      name="minPrice"
                      id="minPrice"
                      placeholder="1000"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>

                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                      Maximális Ár
                    </label>
                    <input
                      type="number"
                      name="maxPrice"
                      id="maxPrice"
                      placeholder="5000"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cím Adatok</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Ország
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    required
                    placeholder="Magyarország"
                    value={address.country}
                    onChange={handleAddressChange}
                    onKeyDown={handleAddressKeyDown}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Város
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    required
                    placeholder="Budapest"
                    value={address.city}
                    onChange={handleAddressChange}
                    onKeyDown={handleAddressKeyDown}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Irányítószám
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    id="postalCode"
                    required
                    placeholder="1234"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    onKeyDown={handleAddressKeyDown}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                    Utca
                  </label>
                  <input
                    type="text"
                    name="street"
                    id="street"
                    required
                    placeholder="Példa utca"
                    value={address.street}
                    onChange={handleAddressChange}
                    onKeyDown={handleAddressKeyDown}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700">
                    Házszám
                  </label>
                  <input
                    type="text"
                    name="houseNumber"
                    id="houseNumber"
                    required
                    placeholder="123"
                    value={address.houseNumber}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>

                <div>
                  <label htmlFor="levelDoor" className="block text-sm font-medium text-gray-700">
                    Emelet, ajtó
                  </label>
                  <input
                    type="text"
                    name="levelDoor"
                    id="levelDoor"
                    placeholder="1. emelet 12. ajtó"
                    value={address.levelDoor}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  />
                </div>
              </div>

              {address.country && address.city && address.postalCode && address.street && address.houseNumber && (
                <div className="relative">
                <AddressMap
                    ref={addressMapRef}
                  country={address.country}
                  city={address.city}
                  postalCode={address.postalCode}
                  street={address.street}
                  houseNumber={address.houseNumber}
                  onCoordinatesUpdate={handleCoordinatesUpdate}
                    onFetchStart={() => setIsFetchingCoordinates(true)}
                  />
                  {isFetchingCoordinates && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                      <div className="text-sm text-gray-600">Koordináták betöltése...</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Média Feltöltés</h2>
              <p className="text-sm text-gray-500 mb-4">
                Maximum {MAX_IMAGES} kép (egyenként max {MAX_IMAGE_SIZE / (1024 * 1024)}MB) és {MAX_VIDEOS} videó (egyenként max {MAX_VIDEO_SIZE / (1024 * 1024)}MB)
              </p>
              
              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Képek ({selectedImages.length}/{MAX_IMAGES})
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Kattints ide a képek feltöltéséhez</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileChange(e, 'image')}
                          className="sr-only"
                          disabled={selectedImages.length >= MAX_IMAGES}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {selectedImages.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Képek ({selectedImages.length}/{MAX_IMAGES})
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <div 
                            className={`relative cursor-pointer ${mainImageIndex === index ? 'ring-2 ring-indigo-500' : ''}`}
                            onClick={() => handleMainImageSelect(index)}
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="h-32 w-full object-cover rounded"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                              {mainImageIndex === index && (
                                <div className="bg-indigo-500 text-white px-2 py-1 rounded-full text-xs">
                                  Fő kép
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file, 'image', index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-7 h-7 text-center flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                          <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                            <span>{(file.size / (1024 * 1024)).toFixed(2)}MB</span>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="radio"
                                name="mainImage"
                                checked={mainImageIndex === index}
                                onChange={() => handleMainImageSelect(index)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs text-gray-600">Fő kép</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Videók ({selectedVideos.length}/{MAX_VIDEOS})
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Kattints ide a videók feltöltéséhez</span>
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => handleFileChange(e, 'video')}
                          className="sr-only"
                          disabled={selectedVideos.length >= MAX_VIDEOS}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {selectedVideos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {selectedVideos.map((file, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={URL.createObjectURL(file)}
                          className="h-32 w-full object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          disabled={true}
                          onClick={() => removeFile(file, 'video', 0)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                        <div className="text-xs text-gray-500 mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)}MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                // disabled={isSubmitting}
                disabled={true}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Beküldés...' : 'Beküldés'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 