// src/hooks/useVideos.js - Updated
import { useQuery } from '@tanstack/react-query'
import { videosApi } from '../api/videosApi'
import useDebounce from './useDebounce'

export function useVideoSearch(query) {
  const debouncedQuery = useDebounce(query, 500)
  
  return useQuery({
    queryKey: ['videos-search', debouncedQuery],
    queryFn: () => videosApi.search(debouncedQuery),
    enabled: !!debouncedQuery,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useTrendingVideos() {
  return useQuery({
    queryKey: ['trending-videos'],
    queryFn: () => videosApi.getTrending(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function useVideoPlaylists() {
  return useQuery({
    queryKey: ['video-playlists'],
    queryFn: () => videosApi.getPlaylists(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}