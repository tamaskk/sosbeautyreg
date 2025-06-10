import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { X, Loader2, Download, Copy, Check, Mail, Trash2 } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

const CATEGORY_LABELS = {
  eyelash: 'Pillás',
  nails: 'Körmös',
  female_hair: 'Női fodrász',
  makeup: 'Sminkes',
  lip_filler: 'Szájfeltöltés',
  male_hair: 'Férfi fodrász',
  laser_hair: 'Lézeres szőrtelenítés',
  cosmetologist: 'Kozmetikus',
  botox: 'Botox',
  permanent_makeup: 'Sminktetoválás',
  waxing: 'Gyanta',
  brow_lash: 'Szemöldök és szempilla',
  hair_extension: 'Hajhosszabbítás',
  pedicure: 'Pedikűr',
  fitness: 'Fitness/mozgás'
} as const;

function UploadModal({ upload, onClose, onDelete, onApprove }: { 
  upload: any, 
  onClose: () => void, 
  onDelete: (id: string) => Promise<void>,
  onApprove: (id: string) => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const MAPBOX_TOKEN = "pk.eyJ1Ijoia2FsbWFudG9taWthIiwiYSI6ImNtMzNiY3pvdDEwZDIya3I2NWwxanJ6cXIifQ.kiSWtgrH6X-l0TpquCKiXA";

  const fetchCoordinates = async (address: {
    country: string;
    city: string;
    postalCode: string;
    street: string;
    houseNumber: string;
  }) => {
    try {
      const addressString = `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}, ${address.country}`;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressString)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          lat: feature.center[1],
          lng: feature.center[0]
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return null;
    }
  };

  const handleDelete = async () => {
    if (!upload._id) {
      console.error('No upload ID found:', upload);
      return;
    }

    if (!window.confirm('Biztosan törölni szeretnéd ezt a feltöltést? Ez a művelet nem vonható vissza.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(upload._id);
      onClose();
    } catch (error) {
      toast.error('Hiba történt a törlés során');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // If coordinates are missing, try to fetch them
      if (!upload.coordinates?.lat || !upload.coordinates?.lng) {
        const coordinates = await fetchCoordinates({
          country: upload.country,
          city: upload.city,
          postalCode: upload.postalCode,
          street: upload.street,
          houseNumber: upload.houseNumber
        });

        if (coordinates) {
          // Update the upload with new coordinates before approving
          const response = await fetch(`/api/uploads/${upload._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coordinates: coordinates
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update coordinates');
          }
        }
      }

      // Proceed with approval
      await onApprove(upload._id);
      onClose();
    } catch (error) {
      console.error('Error during approval:', error);
      toast.error('Hiba történt a jóváhagyás során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!upload._id) {
      console.error('No upload ID found:', upload);
      return;
    }

    setIsDownloading(true);
    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = `/api/uploads/${upload._id}/download`;
      link.download = `${upload.name}_media.zip`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Hiba történt a letöltés során');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CopyableField = ({ label, value, field }: { label: string; value: string; field: string }) => {
    if (!value) return null;
    
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div 
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => copyToClipboard(value, field)}
        >
          <span className="text-gray-700">{value}</span>
          <div className="flex items-center">
            {copiedField === field ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const CopyableCoordinates = ({ lat, lng }: { lat: number; lng: number }) => {
    if (!lat || !lng) return null;

    const latField = 'latitude';
    const lngField = 'longitude';
    
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Koordináták</div>
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => copyToClipboard(lat.toString(), latField)}
          >
            <span className="text-gray-700">Szélesség: {lat.toFixed(6)}</span>
            <div className="flex items-center">
              {copiedField === latField ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </div>
          </div>
          <div 
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => copyToClipboard(lng.toString(), lngField)}
          >
            <span className="text-gray-700">Hosszúság: {lng.toFixed(6)}</span>
            <div className="flex items-center">
              {copiedField === lngField ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasMedia = (upload.images && upload.images.length > 0) || (upload.videos && upload.videos.length > 0);

  if (!upload) return null;

  // Format address components
  const addressParts = [];
  if (upload.postalCode) addressParts.push(upload.postalCode);
  if (upload.city) addressParts.push(upload.city);
  if (upload.street) {
    const streetPart = upload.houseNumber ? `${upload.street} ${upload.houseNumber}` : upload.street;
    addressParts.push(streetPart);
  }
  if (upload.country) addressParts.push(`(${upload.country})`);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Feltöltés Részletei</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CopyableField label="Név (Title)" value={upload.name} field="name" />
              <CopyableField label="Minimális ár (1. variant)" value={upload.minPrice} field="minPrice" />
              <CopyableField label="Maximális ár (2. variant)" value={upload.maxPrice} field="maxPrice" />
              <CopyableField label="Telefon (3. variant)" value={upload.phone} field="phone" />
              <CopyableField label="Hosszúság (4. variant)" value={upload.coordinates.lng} field="longitude" />
              <CopyableField label="Szélesség (5. variant)" value={upload.coordinates.lat} field="latitude" />
              <CopyableField label="Irányítószám (6. variant)" value={upload.postalCode} field="postalCode" />
              <CopyableField label="Város (6. variant)" value={upload.city} field="city" />
              <CopyableField label="Utca (6. variant)" value={upload.street} field="street" />
              <CopyableField label="Házszám (6. variant)" value={upload.houseNumber} field="houseNumber" />
              <CopyableField label="Email (7. variant)" value={upload.email} field="email" />
              <CopyableField label="Instagram (8. variant)" value={upload.instagram} field="instagram" />
              <CopyableField label="Facebook (9. variant)" value={upload.facebook} field="facebook" />
              <CopyableField label="Tiktok (10. variant)" value={upload.tiktok} field="tiktok" />
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Média</h3>
            {!hasMedia ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                Nincs média vagy törölve lett
              </div>
            ) : (
              <>
                {upload.images && upload.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Képek</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {upload.images.map((image: any, index: number) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.url}
                            alt={`Uploaded image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {image.isMain && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
                              Fő kép
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upload.videos && upload.videos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Videók</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upload.videos.map((video: any, index: number) => (
                        <div key={index} className="relative">
                          <video
                            src={video.url}
                            controls
                            className="w-full rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasMedia && (
                  <div className="mt-4">
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Letöltés...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Összes média letöltése
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500">Közösségi Média</h4>
            <div className="mt-2 space-y-2">
              {upload.instagram && (
                <a
                  href={`https://instagram.com/${upload.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  {upload.instagram}
                </a>
              )}
              {upload.facebook && (
                <a
                  href={`https://facebook.com/${upload.facebook.replace('facebook.com/', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {upload.facebook}
                </a>
              )}
              {upload.tiktok && (
                <a
                  href={`https://tiktok.com/@${upload.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  {upload.tiktok}
                </a>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleApprove}
              disabled={isLoading || upload.success === true}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Feldolgozás...' : 'Jóváhagyás'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Törlés...' : 'Törlés'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageModal({ message, onClose, onDelete, onMarkAsRead }: {
  message: any;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onMarkAsRead: (id: string, read: boolean) => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    if (!message._id) return;
    if (!window.confirm('Biztosan törölni szeretnéd ezt az üzenetet?')) return;

    setIsDeleting(true);
    try {
      await onDelete(message._id);
      onClose();
    } catch (error) {
      toast.error('Hiba történt a törlés során');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!message._id) return;
    setIsUpdating(true);
    try {
      await onMarkAsRead(message._id, !message.read);
      onClose();
    } catch (error) {
      toast.error('Hiba történt a frissítés során');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Üzenet Részletei</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Feladó</h3>
              <p className="mt-1 text-gray-900">{message.name}</p>
              <p className="text-gray-600">{message.email}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Tárgy</h3>
              <p className="mt-1 text-gray-900">{message.subject}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Üzenet</h3>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{message.message}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Dátum</h3>
              <p className="mt-1 text-gray-900">
                {new Date(message.createdAt).toLocaleString('hu-HU')}
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={handleMarkAsRead}
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Frissítés...
                  </>
                ) : message.read ? (
                  'Megjelölés olvasatlanként'
                ) : (
                  'Megjelölés olvasottként'
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Törlés...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Törlés
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('forms');
  const [isLoading, setIsLoading] = useState(false);
  const [uploads, setUploads] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customCodeForm, setCustomCodeForm] = useState({
    email: '',
    categories: [] as string[],
    usageLimit: 1,
    codeLength: 8
  });
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    // If user is authenticated, fetch data
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [uploadsRes, messagesRes] = await Promise.all([
        fetch('/api/uploads-list'),
        fetch('/api/messages'),
      ]);

      if (!uploadsRes.ok || !messagesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [uploadsData, messagesData] = await Promise.all([
        uploadsRes.json(),
        messagesRes.json(),
      ]);

      console.log('Fetched uploads:', uploadsData.map((u: any) => ({ id: u._id, success: u.success })));

      // Sort uploads: unapproved first (newest to oldest), then approved (newest to oldest)
      const sortedUploads = uploadsData.sort((a: any, b: any) => {
        // First, sort by approval status (unapproved first)
        if (a.success !== b.success) {
          return a.success ? 1 : -1;
        }
        // Then sort by date within each group (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setUploads(sortedUploads);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Hiba történt az adatok betöltése során');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Érvénytelen jelszó');
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleDeleteUpload = async (id: string) => {
    try {
      const response = await fetch(`/api/uploads/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete upload');
      }

      toast.success('Feltöltés sikeresen törölve');
      fetchData(); // Refresh the data
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleApproveUpload = async (id: string) => {
    try {
      console.log('Approving upload with ID:', id);
      const response = await fetch(`/api/uploads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to approve upload');
      }

      const data = await response.json();
      console.log('Approval response:', data);

      // Update the uploads list
      setUploads(prevUploads => 
        prevUploads.map(upload => 
          upload._id === id ? { ...upload, success: true } : upload
        )
      );

      toast.success('Sikeres jóváhagyás');
    } catch (error) {
      console.error('Error approving upload:', error);
      toast.error('Hiba történt a jóváhagyás során');
      throw error;
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/messages?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      toast.success('Üzenet sikeresen törölve');
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleMarkMessageAsRead = async (id: string, read: boolean) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, read }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      toast.success('Üzenet sikeresen frissítve');
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Bejelentkezés
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  Jelszó
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Jelszó"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Bejelentkezés
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - SOS Beauty</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Kijelentkezés
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('forms')}
              className={`${
                activeTab === 'forms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Űrlapok
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Üzenetek
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'forms' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Beküldött Bejegyzések
              </h2>
              {isLoading ? (
                <p className="text-gray-500">Betöltés...</p>
              ) : uploads.length === 0 ? (
                <p className="text-gray-500">Nincsenek feltöltések</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Név
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Kategória
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Telefon
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Dátum
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Státusz
                        </th>
                        <th
                          scope="col"
                          className="relative px-6 py-3"
                        >
                          <span className="sr-only">Műveletek</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploads.map((upload) => (
                        <tr key={upload._id} className={upload.success ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {upload.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {CATEGORY_LABELS[upload.category as keyof typeof CATEGORY_LABELS] || upload.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {upload.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {upload.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(upload.createdAt).toLocaleDateString('hu-HU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {upload.success === null ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Folyamatban...
                              </span>
                            ) : upload.success ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Jóváhagyva
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Folyamatban...
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedUpload(upload);
                                setIsModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Részletek
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Kapcsolati Üzenetek
              </h2>
              {isLoading ? (
                <p className="text-gray-500">Betöltés...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500">Nincsenek üzenetek</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Feladó
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tárgy
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Dátum
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Státusz
                        </th>
                        <th
                          scope="col"
                          className="relative px-6 py-3"
                        >
                          <span className="sr-only">Műveletek</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {messages.map((message) => (
                        <tr key={message._id} className={message.read ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {message.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {message.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {message.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(message.createdAt).toLocaleString('hu-HU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              message.read
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {message.read ? 'Olvasott' : 'Olvasatlan'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setIsMessageModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Részletek
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedUpload && (
        <UploadModal
          upload={selectedUpload}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUpload(null);
          }}
          onDelete={handleDeleteUpload}
          onApprove={handleApproveUpload}
        />
      )}

      {selectedMessage && (
        <MessageModal
          message={selectedMessage}
          onClose={() => {
            setIsMessageModalOpen(false);
            setSelectedMessage(null);
          }}
          onDelete={handleDeleteMessage}
          onMarkAsRead={handleMarkMessageAsRead}
        />
      )}
    </>
  );
} 