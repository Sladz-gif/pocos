import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

interface MarketplaceStore {
  listings: any[];
  savedListingIds: string[];
  orders: any[];
  discounts: any[];
  featuredRanches: any[];
  currentRanch: any | null;
  cart: any[];
  deliveryAddresses: any[];
  paymentMethods: any[];
  isLoading: boolean;
  
  // Actions
  fetchListings: (ranchId?: string) => Promise<void>;
  fetchRanchDetails: (ranchId: string) => Promise<void>;
  fetchRanchOrders: (ranchId: string) => Promise<void>;
  fetchBuyerOrders: (buyerId: string) => Promise<void>;
  fetchDiscounts: (ranchId: string) => Promise<void>;
  fetchSavedListings: (userId: string) => Promise<void>;
  fetchFeaturedRanches: () => Promise<void>;
  fetchDeliveryAddresses: (userId: string) => Promise<void>;
  fetchPaymentMethods: (userId: string) => Promise<void>;
  toggleSaved: (listingId: string, userId: string) => Promise<void>;
  addListing: (listing: any, ranchId: string) => Promise<void>;
  updateListing: (id: string, updates: any) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  createOrder: (order: any, ranchId: string) => Promise<void>;
  addDiscount: (discount: any, ranchId: string) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;
  addDeliveryAddress: (address: any, userId: string) => Promise<void>;
  updateDeliveryAddress: (id: string, updates: any) => Promise<void>;
  deleteDeliveryAddress: (id: string) => Promise<void>;
  addPaymentMethod: (method: any, userId: string) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  listings: [],
  savedListingIds: [],
  orders: [],
  discounts: [],
  featuredRanches: [],
  currentRanch: null,
  cart: [],
  deliveryAddresses: [],
  paymentMethods: [],
  isLoading: false,

  fetchListings: async (ranchId?: string) => {
    set({ isLoading: true });
    let query = supabase
      .from('store_listings')
      .select(`
        *,
        ranch (
          name,
          location,
          logo_url
        )
      `)
      .order('created_at', { ascending: false });
    
    if (ranchId) {
      query = query.eq('ranch_id', ranchId);
    }

    const { data } = await query;
    if (data) {
      const listings: any[] = data.map((row: any) => ({
        id: row.id,
        productName: row.product_name,
        category: row.category,
        price: row.price,
        unit: row.unit,
        stock: row.stock_quantity,
        status: row.status,
        discount: row.discount_percentage,
        imageUrl: row.image_url,
        photos: row.photos || [],
        animalId: row.animal_id,
        ranchId: row.ranch_id,
        ranch: row.ranch,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ listings, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchRanchDetails: async (ranchId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('ranch')
      .select('*')
      .eq('id', ranchId)
      .single();
    
    if (data && !error) {
      set({ currentRanch: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addListing: async (listing: any, ranchId: string) => {
    const newListing = { 
      id: uuidv4(), 
      product_name: listing.productName,
      category: listing.category,
      price: listing.price,
      unit: listing.unit,
      stock_quantity: listing.stock,
      status: listing.status || 'listed',
      discount_percentage: listing.discount || 0,
      image_url: listing.imageUrl,
      photos: listing.photos || [],
      animal_id: listing.animalId,
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('store_listings').insert(newListing);
    if (error) throw error;
    
    // Refresh listings after adding
    const { fetchListings } = get();
    await fetchListings(ranchId);
  },

  updateListing: async (id: string, updates: any) => {
    const supabaseUpdates: any = {};
    if (updates.status) supabaseUpdates.status = updates.status;
    if (updates.price) supabaseUpdates.price = updates.price;
    if (updates.stock) supabaseUpdates.stock_quantity = updates.stock;
    if (updates.productName) supabaseUpdates.product_name = updates.productName;
    if (updates.category) supabaseUpdates.category = updates.category;
    if (updates.unit) supabaseUpdates.unit = updates.unit;
    if (updates.imageUrl) supabaseUpdates.image_url = updates.imageUrl;
    if (updates.photos) supabaseUpdates.photos = updates.photos;
    if (updates.animalId) supabaseUpdates.animal_id = updates.animalId;
    
    const { error } = await supabase.from('store_listings').update(supabaseUpdates).eq('id', id);
    if (error) throw error;
    
    set((state: any) => ({
      listings: state.listings.map((l: any) => l.id === id ? { ...l, ...updates } : l),
    }));
  },

  deleteListing: async (id: string) => {
    const { error } = await supabase.from('store_listings').delete().eq('id', id);
    if (error) throw error;
    set((state: any) => ({
      listings: state.listings.filter((l: any) => l.id !== id),
    }));
  },

  updateOrderStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    
    set((state: any) => ({
      orders: state.orders.map((o: any) => o.id === id ? { ...o, status } : o),
    }));
  },

  fetchRanchOrders: async (ranchId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        store_listings (product_name),
        ranch_users (name)
      `)
      .eq('ranch_id', ranchId)
      .order('order_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching ranch orders:', error);
      set({ isLoading: false });
      return;
    }

    if (data) {
      const orders: any[] = data.map((row: any) => ({
        id: row.id,
        buyerName: row.ranch_users?.name || 'Unknown Buyer',
        item: row.store_listings?.product_name || 'Deleted Product',
        quantity: row.quantity,
        total: row.total_amount,
        status: row.status,
        orderDate: row.order_date,
      }));
      set({ orders, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchBuyerOrders: async (buyerId: string) => {
    if (!isUUID(buyerId)) return;
    set({ isLoading: true });
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        ranch (
          id,
          name,
          logo_url,
          owner_id
        ),
        store_listings (
          product_name,
          image_url
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    
    if (data) {
      const orders = data.map((row: any) => ({
        id: row.id,
        listingId: row.listing_id,
        buyerId: row.buyer_id,
        ranchId: row.ranch_id,
        quantity: row.quantity,
        totalPrice: row.total_amount,
        status: row.status,
        createdAt: row.created_at,
        ranch: row.ranch,
        productName: row.store_listings?.product_name,
        imageUrl: row.store_listings?.image_url,
      }));
      set({ orders, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  createOrder: async (order: any, ranchId: string) => {
    const newOrder = { 
      id: uuidv4(), 
      buyer_id: order.buyerId,
      listing_id: order.listingId,
      quantity: order.quantity,
      total_amount: order.total,
      status: 'pending',
      ranch_id: ranchId,
    };
    const { error } = await supabase.from('orders').insert(newOrder);
    if (error) throw error;
    
    // Refresh relevant orders
    const { fetchBuyerOrders } = get();
    await fetchBuyerOrders(order.buyerId);
  },

  fetchDiscounts: async (ranchId: string) => {
    const { data } = await supabase
      .from('discounts')
      .select('*')
      .eq('ranch_id', ranchId)
      .order('created_at', { ascending: false });
    if (data) {
      set({ discounts: data });
    }
  },

  addDiscount: async (discount: any, ranchId: string) => {
    const newDiscount = {
      id: uuidv4(),
      code: discount.code,
      type: discount.type,
      value: discount.value,
      status: 'active',
      usage_count: 0,
      ranch_id: ranchId,
      created_at: new Date().toISOString(),
    };
    await supabase.from('discounts').insert(newDiscount);
    set((state: any) => ({ discounts: [newDiscount, ...state.discounts] }));
  },

  deleteDiscount: async (id: string) => {
    const { error } = await supabase.from('discounts').delete().eq('id', id);
    if (error) throw error;
    set((state: any) => ({
      discounts: state.discounts.filter((d: any) => d.id !== id),
    }));
  },

  fetchSavedListings: async (userId: string) => {
    if (!isUUID(userId)) return;
    const { data, error } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching saved listings:', error);
      return;
    }

    if (data) {
      set({ savedListingIds: data.map(row => row.listing_id) });
    }
  },

  fetchFeaturedRanches: async () => {
    const { data, error } = await supabase
      .from('ranch')
      .select('id, name, location, logo_url')
      .eq('is_featured', true)
      .limit(5);
    
    if (error) {
      console.error('Error fetching featured ranches:', error);
      return;
    }

    if (data) {
      set({ featuredRanches: data });
    }
  },

  toggleSaved: async (listingId: string, userId: string) => {
    const { savedListingIds } = get();
    const isSaved = savedListingIds.includes(listingId);

    if (isSaved) {
      // Remove from DB
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
      
      if (error) throw error;

      set({
        savedListingIds: savedListingIds.filter(id => id !== listingId)
      });
    } else {
      // Add to DB
      const { error } = await supabase
        .from('saved_listings')
        .insert({ user_id: userId, listing_id: listingId });
      
      if (error) throw error;

      set({
        savedListingIds: [...savedListingIds, listingId]
      });
    }
  },

  addToCart: (product, quantity) => {
    const { cart } = get();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      set({
        cart: cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      });
    } else {
      set({ cart: [...cart, { ...product, quantity }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.id !== productId) });
  },

  updateCartQuantity: (productId, quantity) => {
    set({
      cart: get().cart.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    });
  },

  clearCart: () => set({ cart: [] }),

  fetchDeliveryAddresses: async (userId: string) => {
    if (!isUUID(userId)) return;
    const { data } = await supabase
      .from('delivery_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (data) set({ deliveryAddresses: data });
  },

  addDeliveryAddress: async (address: any, userId: string) => {
    if (!isUUID(userId)) return;
    const newAddress = {
      ...address,
      user_id: userId,
      id: uuidv4(),
    };
    const { error } = await supabase.from('delivery_addresses').insert(newAddress);
    if (error) throw error;
    set((state: any) => ({ deliveryAddresses: [...state.deliveryAddresses, newAddress] }));
  },

  updateDeliveryAddress: async (id: string, updates: any) => {
    if (!isUUID(id)) return;
    const { error } = await supabase.from('delivery_addresses').update(updates).eq('id', id);
    if (error) throw error;
    set((state: any) => ({
      deliveryAddresses: state.deliveryAddresses.map((a: any) => a.id === id ? { ...a, ...updates } : a),
    }));
  },

  deleteDeliveryAddress: async (id: string) => {
    if (!isUUID(id)) return;
    const { error } = await supabase.from('delivery_addresses').delete().eq('id', id);
    if (error) throw error;
    set((state: any) => ({
      deliveryAddresses: state.deliveryAddresses.filter((a: any) => a.id !== id),
    }));
  },

  fetchPaymentMethods: async (userId: string) => {
    if (!isUUID(userId)) return;
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (data) set({ paymentMethods: data });
  },

  addPaymentMethod: async (method: any, userId: string) => {
    if (!isUUID(userId)) return;
    const newMethod = {
      ...method,
      user_id: userId,
      id: uuidv4(),
    };
    const { error } = await supabase.from('payment_methods').insert(newMethod);
    if (error) throw error;
    set((state: any) => ({ paymentMethods: [...state.paymentMethods, newMethod] }));
  },

  deletePaymentMethod: async (id: string) => {
    if (!isUUID(id)) return;
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) throw error;
    set((state: any) => ({
      paymentMethods: state.paymentMethods.filter((m: any) => m.id !== id),
    }));
  },
}));
