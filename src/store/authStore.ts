import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { User, Ranch, UserRole } from '../types';

interface AuthStore {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: User | null;
  ranch: Ranch | null;
  staff: User[];
  isLoading: boolean;
  
  // Actions
  loginAsRanch: (name: string, accessCode: string) => Promise<void>;
  loginAsOwner: (email: string, password?: string) => Promise<void>;
  loginAsConsumer: (email: string, name: string) => Promise<void>;
  signupAsConsumer: (data: Partial<User>) => Promise<void>;
  signupAsRanchOwner: (data: { name: string; email: string; password?: string; ranchName: string; ranchLocation: string }) => Promise<void>;
  fetchStaff: (ranchId: string) => Promise<void>;
  onboardStaff: (name: string, role: string, accessCode: string) => Promise<void>;
  updateStaff: (staffId: string, updates: Partial<User>) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  updateRanch: (updates: Partial<Ranch>) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

// Helper to generate a unique-ish access code
const generateCode = (prefix: string) => {
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestampPart = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${randomPart}${timestampPart}`;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  userRole: null,
  user: null,
  ranch: null,
  staff: [],
  isLoading: false,

  setLoading: (isLoading) => set({ isLoading }),

  fetchStaff: async (ranchId: string) => {
    const { data, error } = await supabase
      .from('ranch_users')
      .select('*')
      .eq('ranch_id', ranchId)
      .eq('is_active', true);
    
    if (data && !error) {
      const staff: User[] = data.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role as UserRole,
        accessCode: row.access_code,
        isActive: row.is_active,
        permissions: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
      set({ staff });
    }
  },

  updateRanch: async (updates: Partial<Ranch>) => {
    const { ranch } = get();
    if (!ranch?.id) return;

    const supabaseUpdates: any = {};
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.location) supabaseUpdates.location = updates.location;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.logo) supabaseUpdates.logo_url = updates.logo;
    if (updates.coverImage) supabaseUpdates.cover_url = updates.coverImage;
    if (updates.contactEmail !== undefined) supabaseUpdates.contact_email = updates.contactEmail;
    if (updates.contactPhone !== undefined) supabaseUpdates.contact_phone = updates.contactPhone;
    if (updates.website !== undefined) supabaseUpdates.website = updates.website;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.currency !== undefined) supabaseUpdates.currency = updates.currency;

    const { data, error } = await supabase
      .from('ranch')
      .update(supabaseUpdates)
      .eq('id', ranch.id)
      .select()
      .single();

    if (data && !error) {
      set({ 
        ranch: {
          ...ranch,
          name: data.name,
          location: data.location,
          description: data.description,
          logo: data.logo_url,
          coverImage: data.cover_url,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          website: data.website,
          notes: data.notes,
          currency: data.currency,
        }
      });
    }
  },

  restoreSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Get the profile from ranch_users
      const { data: userData } = await supabase
        .from('ranch_users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (userData) {
        const { data: ranchData } = await supabase
          .from('ranch')
          .select('*')
          .eq('id', userData.ranch_id)
          .single();
        
        let ranch: Ranch | null = null;
        if (ranchData) {
          ranch = {
            id: ranchData.id,
            name: ranchData.name,
            location: ranchData.location,
            description: ranchData.description,
            logo: ranchData.logo_url,
            coverImage: ranchData.cover_url,
            contactEmail: ranchData.contact_email,
            contactPhone: ranchData.contact_phone,
            website: ranchData.website,
            notes: ranchData.notes,
            currency: ranchData.currency,
            ownerId: ranchData.owner_id,
            code: ranchData.code,
            settings: ranchData.settings,
            createdAt: ranchData.created_at,
            updatedAt: ranchData.updated_at,
          };
        }

        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          accessCode: userData.access_code,
          isActive: userData.is_active,
          permissions: [],
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
        };

        set({ isAuthenticated: true, user, ranch, userRole: userData.role as UserRole });
      }
    }
  },

  loginAsOwner: async (email: string, password?: string) => {
    set({ isLoading: true });
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      // 1. Try to sign in with Supabase Auth if password is provided
      // If no password, we fall back to the "magic" email lookup for existing project compatibility
      if (password) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        
        if (authError) throw authError;
      }

      // 2. Fetch the profile from ranch_users
      const { data: userData, error: userError } = await supabase
        .from('ranch_users')
        .select('*')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        console.error('Profile fetch error:', userError);
        throw new Error('User profile not found. Did you complete the signup?');
      }

      // 3. Fetch the ranch data
      const { data: ranchData } = await supabase
        .from('ranch')
        .select('*')
        .eq('id', userData.ranch_id)
        .single();
      
      let ranch: Ranch | null = null;
      if (ranchData) {
        ranch = {
          id: ranchData.id,
          name: ranchData.name,
          location: ranchData.location,
          description: ranchData.description,
          logo: ranchData.logo_url,
          coverImage: ranchData.cover_url,
          contactEmail: ranchData.contact_email,
          contactPhone: ranchData.contact_phone,
          website: ranchData.website,
          notes: ranchData.notes,
          currency: ranchData.currency,
          ownerId: ranchData.owner_id,
          code: ranchData.code,
          settings: ranchData.settings,
          createdAt: ranchData.created_at,
          updatedAt: ranchData.updated_at,
        };
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        accessCode: userData.access_code,
        isActive: userData.is_active,
        permissions: [],
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      set({ isAuthenticated: true, user, ranch, userRole: userData.role as UserRole, isLoading: false });
    } catch (error: any) {
      console.error('Login failed:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Login failed');
    }
  },

  loginAsRanch: async (name: string, accessCode: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('ranch_users')
      .select('*')
      .eq('name', name.trim())
      .eq('access_code', accessCode.toUpperCase())
      .eq('is_active', true)
      .single();
    if (error || !data) {
      set({ isLoading: false });
      throw new Error('Invalid name or access code');
    }
    const { data: ranchData } = await supabase
      .from('ranch')
      .select('*')
      .eq('id', data.ranch_id)
      .single();
    
    let ranch: Ranch | null = null;
    if (ranchData) {
      ranch = {
        id: ranchData.id,
        name: ranchData.name,
        location: ranchData.location,
        description: ranchData.description,
        logo: ranchData.logo_url,
        coverImage: ranchData.cover_url,
        contactEmail: ranchData.contact_email,
        contactPhone: ranchData.contact_phone,
        website: ranchData.website,
        notes: ranchData.notes,
        ownerId: ranchData.owner_id,
        code: ranchData.code,
        settings: ranchData.settings,
        createdAt: ranchData.created_at,
        updatedAt: ranchData.updated_at,
      };
    }

    const user: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      accessCode: data.access_code,
      isActive: data.is_active,
      permissions: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    set({ isAuthenticated: true, user, ranch, userRole: data.role as UserRole, isLoading: false });
  },

  loginAsConsumer: async (email: string, name: string) => {
    set({ isLoading: true });
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      // 1. Check if user already exists in ranch_users
      let { data: userData, error: userError } = await supabase
        .from('ranch_users')
        .select('*')
        .eq('email', cleanEmail)
        .eq('role', 'buyer')
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        throw userError;
      }

      // 2. If not exists, create a new buyer profile
      if (!userData) {
        const { data: newUserData, error: createError } = await supabase
          .from('ranch_users')
          .insert({
            name: name.trim(),
            email: cleanEmail,
            role: 'buyer',
            is_active: true,
            access_code: `BUYER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          })
          .select()
          .single();

        if (createError) throw createError;
        userData = newUserData;
      }

      const user: User = {
        id: userData!.id,
        name: userData!.name,
        email: userData!.email,
        role: userData!.role as UserRole,
        accessCode: userData!.access_code,
        isActive: userData!.is_active,
        permissions: [],
        createdAt: userData!.created_at,
        updatedAt: userData!.updated_at,
      };

      set({ isAuthenticated: true, user, ranch: null, userRole: 'buyer', isLoading: false });
    } catch (error: any) {
      console.error('Consumer login failed:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Failed to login as consumer');
    }
  },

  signupAsConsumer: async (data) => {
    set({ isLoading: true });
    try {
      const cleanEmail = (data.email || '').trim().toLowerCase();
      
      // Consumers can sign up with just email/name, or via Auth
      // For now, let's just create a record in ranch_users with role 'buyer'
      // Ideally this would also use auth.signUp, but following the existing 'simpler' flow for consumers
      
      const { data: userData, error: userError } = await supabase
        .from('ranch_users')
        .insert({
          name: data.name || 'New Buyer',
          email: cleanEmail,
          role: 'buyer',
          is_active: true,
          access_code: generateCode('BUYER'),
        })
        .select()
        .single();

      if (userError || !userData) {
        throw new Error(userError?.message || 'Failed to create buyer profile');
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        accessCode: userData.access_code,
        isActive: userData.is_active,
        permissions: [],
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
      
      set({ isAuthenticated: true, user, ranch: null, userRole: 'buyer', isLoading: false });
    } catch (error: any) {
      console.error('Consumer signup failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signupAsRanchOwner: async (data: { name: string; email: string; password?: string; ranchName: string; ranchLocation: string }) => {
    set({ isLoading: true });
    
    const cleanEmail = data.email.trim().toLowerCase();
    const defaultPassword = data.password || 'TemporaryPassword123!';
    
    try {
      console.log('Starting signup flow for:', cleanEmail);
      
      // 1. Create Supabase Auth User
      let { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: defaultPassword,
        options: {
          data: {
            full_name: data.name,
          }
        }
      });

      // Handle the case where user already exists in Auth but not in our database
      if (authError?.message?.includes('already registered')) {
        console.log('User already exists in Auth. Attempting to sign in and complete profile...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: defaultPassword,
        });
        
        if (signInError) {
          console.error('SignIn error during recovery:', signInError);
          throw new Error('User already exists. Please log in instead.');
        }
        authData = signInData;
      } else if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Auth user returned as null. Please try logging in.');
      }

      console.log('Auth user ready:', authData.user.id);

      // Check if user already has a profile in ranch_users
      const { data: existingUser } = await supabase
        .from('ranch_users')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single();
      
      if (existingUser) {
        console.log('Profile already exists. Logging in...');
        // If profile exists, we just restore the session
        const { restoreSession } = get() as any;
        await restoreSession();
        set({ isLoading: false });
        return;
      }

      // 2. Generate a unique ranch code
      const ranchCode = generateCode('RANCH');
      
      // 3. Create the ranch
      console.log('Attempting to create ranch with data:', { name: data.ranchName, location: data.ranchLocation, code: ranchCode });
      const { data: ranchData, error: ranchError } = await supabase
        .from('ranch')
        .insert({
          name: data.ranchName,
          location: data.ranchLocation,
          code: ranchCode,
        })
        .select()
        .single();
      
      if (ranchError || !ranchData) {
        console.error('Ranch creation error:', ranchError);
        throw new Error(ranchError?.message || 'Failed to create ranch record');
      }

      console.log('Ranch created successfully:', ranchData.id);
      
      // 4. Create the ranch owner user profile in ranch_users
      const { data: userData, error: userError } = await supabase
        .from('ranch_users')
        .insert({
          auth_id: authData.user.id,
          name: data.name,
          email: cleanEmail,
          role: 'super_admin',
          ranch_id: ranchData.id,
          access_code: generateCode('OWNER'),
          is_active: true,
        })
        .select()
        .single();
      
      if (userError || !userData) {
        console.error('User profile creation error:', userError);
        // Rollback
        await supabase.from('ranch').delete().eq('id', ranchData.id);
        throw new Error(userError?.message || 'Failed to create owner profile');
      }

      console.log('User profile created successfully:', userData.id);
      
      // 5. Update ranch with real owner_id
      await supabase
        .from('ranch')
        .update({ owner_id: userData.id })
        .eq('id', ranchData.id);

      const ranch: Ranch = {
        id: ranchData.id,
        name: ranchData.name,
        location: ranchData.location,
        ownerId: userData.id,
        code: ranchData.code,
        settings: ranchData.settings,
        createdAt: ranchData.created_at,
        updatedAt: ranchData.updated_at,
      };
      
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        accessCode: userData.access_code,
        isActive: userData.is_active,
        permissions: [],
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
      
      set({ isAuthenticated: true, user, ranch, userRole: 'super_admin', isLoading: false });
    } catch (error: any) {
      console.error('Registration flow failed detail:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Failed to register ranch');
    }
  },

  onboardStaff: async (name: string, role: string, accessCode: string) => {
    set({ isLoading: true });
    const { ranch, fetchStaff } = get();
    
    if (!ranch?.id) {
      set({ isLoading: false });
      throw new Error('No ranch context found. Please log in again.');
    }

    try {
      const { error } = await supabase
        .from('ranch_users')
        .insert({
          name: name.trim(),
          role,
          access_code: accessCode.toUpperCase(),
          ranch_id: ranch.id,
          is_active: true,
        });

      if (error) throw error;
      
      // Refresh the staff list after successful onboarding
      await fetchStaff(ranch.id);
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Failed to onboard staff');
    }
  },

  updateStaff: async (staffId: string, updates: Partial<User>) => {
    set({ isLoading: true });
    const { ranch, fetchStaff } = get();
    
    if (!ranch?.id) {
      set({ isLoading: false });
      throw new Error('No ranch context found.');
    }

    try {
      const supabaseUpdates: any = {};
      if (updates.name) supabaseUpdates.name = updates.name;
      if (updates.role) supabaseUpdates.role = updates.role;
      if (updates.accessCode) supabaseUpdates.access_code = updates.accessCode;
      if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('ranch_users')
        .update(supabaseUpdates)
        .eq('id', staffId);

      if (error) throw error;
      
      await fetchStaff(ranch.id);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Update staff failed:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Failed to update staff member');
    }
  },

  deleteStaff: async (staffId: string) => {
    set({ isLoading: true });
    const { ranch, fetchStaff } = get();
    
    if (!ranch?.id) {
      set({ isLoading: false });
      throw new Error('No ranch context found.');
    }

    try {
      // We do a soft delete by setting is_active to false
      const { error } = await supabase
        .from('ranch_users')
        .update({ is_active: false })
        .eq('id', staffId);

      if (error) throw error;
      
      await fetchStaff(ranch.id);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Delete staff failed:', error);
      set({ isLoading: false });
      throw new Error(error.message || 'Failed to delete staff member');
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null, ranch: null, userRole: null });
  },
}));
