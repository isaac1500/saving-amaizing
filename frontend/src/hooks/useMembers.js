import { useState, useCallback, useEffect } from 'react';
import { getAllMembers, createMember, updateMember, deleteMember } from '../services/memberService';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching members...');
      const membersList = await getAllMembers(filters);
      setMembers(membersList);
      return membersList;
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMembers = useCallback(async (searchTerm) => {
    setSearchLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Searching members:', searchTerm);
      const filteredMembers = await getAllMembers({ search: searchTerm });
      return filteredMembers;
    } catch (error) {
      console.error('Error searching members:', error);
      setError(error.message);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const addMember = useCallback(async (memberData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('➕ Creating new member...');
      const newMember = await createMember(memberData);
      await fetchMembers();
      return newMember;
    } catch (error) {
      console.error('Error creating member:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const removeMember = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🗑️ Deleting member...');
      await deleteMember(id);
      await fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  const editMember = useCallback(async (id, memberData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('✏️ Updating member...');
      const updatedMember = await updateMember(id, memberData);
      await fetchMembers();
      return updatedMember;
    } catch (error) {
      console.error('Error updating member:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    searchLoading,
    fetchMembers,
    searchMembers,
    createMember: addMember,
    updateMember: editMember,
    deleteMember: removeMember,
    refreshMembers: fetchMembers
  };
};