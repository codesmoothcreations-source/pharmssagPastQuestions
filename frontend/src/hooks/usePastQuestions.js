// src/hooks/usePastQuestions.js - Updated
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { pastQuestionsApi } from '../api/pastQuestionsApi'

export function usePastQuestions(params = {}) {
  return useQuery({
    queryKey: ['past-questions', params],
    queryFn: () => pastQuestionsApi.getAll(params),
    // Handle different response structures
    select: (data) => {
      if (Array.isArray(data)) {
        return data
      }
      
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      if (data?.pastQuestions && Array.isArray(data.pastQuestions)) {
        return data.pastQuestions
      }
      
      if (data?.results && Array.isArray(data.results)) {
        return data.results
      }
      
      console.warn('Unexpected past questions data structure:', data)
      return []
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInfinitePastQuestions(params = {}) {
  return useInfiniteQuery({
    queryKey: ['past-questions-infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      pastQuestionsApi.getAll({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => {
      // Check if there's more data based on your API response
      if (lastPage?.hasMore) {
        return pages.length + 1
      }
      if (lastPage?.nextPage) {
        return lastPage.nextPage
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePastQuestionById(id) {
  return useQuery({
    queryKey: ['past-question', id],
    queryFn: () => pastQuestionsApi.getById(id),
    enabled: !!id,
    retry: 1,
    staleTime: 10 * 60 * 1000, // 10 minutes for single item
  })
}

export function useSearchPastQuestions(query, params = {}) {
  return useQuery({
    queryKey: ['past-questions-search', query, params],
    queryFn: () => pastQuestionsApi.search(query, params),
    enabled: !!query,
    select: (data) => {
      if (Array.isArray(data)) {
        return data
      }
      
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      if (data?.results && Array.isArray(data.results)) {
        return data.results
      }
      
      console.warn('Unexpected search results structure:', data)
      return []
    },
    retry: 1,
  })
}

export function useCreatePastQuestion(onProgress) {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Pass the progress handler down to the API
    mutationFn: (formData) => pastQuestionsApi.create(formData, onProgress),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['past-questions'])
      queryClient.invalidateQueries(['past-questions-infinite'])
      queryClient.invalidateQueries(['past-questions-search'])
      
      // Add to cache if needed
      if (data) {
        const newQuestion = data.data || data
        queryClient.setQueryData(['past-question', newQuestion._id], newQuestion)
      }
      
      return data
    },
    onError: (error) => {
      console.error('Create past question error:', error)
      throw error
    }
  })
}

export function useUpdatePastQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => pastQuestionsApi.update(id, data),
    onSuccess: (data, variables) => {
      const { id } = variables;
      
      // Refresh the data silently in the background
      queryClient.invalidateQueries(['past-questions']);
      queryClient.invalidateQueries(['past-question', id]);
      
      if (data) {
        const updatedDoc = data.data || data;
        queryClient.setQueryData(['past-question', id], updatedDoc);
      }
      // REMOVED the toast from here so only the Page component shows it
    },
  });
}

export function useDeletePastQuestion() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => pastQuestionsApi.delete(id),
    onSuccess: (data, id) => {
      // Invalidate queries
      queryClient.invalidateQueries(['past-questions'])
      queryClient.invalidateQueries(['past-questions-infinite'])
      queryClient.invalidateQueries(['past-questions-search'])
      
      // Remove from cache
      queryClient.removeQueries(['past-question', id])
      
      return data
    },
    onError: (error) => {
      console.error('Delete past question error:', error)
      throw error
    }
  })
}

export function usePastQuestionStats() {
  return useQuery({
    queryKey: ['past-questions-stats'],
    queryFn: () => pastQuestionsApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function usePastQuestionAcademicYears() {
  return useQuery({
    queryKey: ['past-questions-academic-years'],
    queryFn: () => pastQuestionsApi.getAcademicYears(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useTrackView() {
  return useMutation({
    mutationFn: (id) => pastQuestionsApi.incrementViews(id),
    onSuccess: (data, id) => {
      // Update view count in cache
      const queryClient = useQueryClient()
      const current = queryClient.getQueryData(['past-question', id])
      if (current) {
        queryClient.setQueryData(['past-question', id], {
          ...current,
          views: (current.views || 0) + 1
        })
      }
    }
  })
}

export function useTrackDownload() {
  return useMutation({
    mutationFn: (id) => pastQuestionsApi.incrementDownloads(id),
    onSuccess: (data, id) => {
      // Update download count in cache
      const queryClient = useQueryClient()
      const current = queryClient.getQueryData(['past-question', id])
      if (current) {
        queryClient.setQueryData(['past-question', id], {
          ...current,
          downloads: (current.downloads || 0) + 1
        })
      }
    }
  })
}