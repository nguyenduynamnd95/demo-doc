import { useMutation, useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosInstance";
import { DocNote, DocNoteUpsertParams } from "@/types/main";
import queryClient from "@/lib/queryClient";

export const useGetNotes = (docVerId: number) => {
	return useQuery({
		queryKey: ['notes', docVerId],
		queryFn: () => axiosInstance.get<DocNote[]>(`/documents/${docVerId}/notes`),
	})
}

export const useAddNote = (docVerId: number) => {
	return useMutation({
		mutationFn: (variables: DocNoteUpsertParams) => axiosInstance.post(`/documents/${docVerId}/notes`, variables),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', docVerId] })
	})
}

export const useUpdateNote = (docVerId: number) => {
	return useMutation({
		mutationFn: (variables: DocNoteUpsertParams & {
			id: number
		}) => axiosInstance.put(`/documents/${docVerId}/notes/${variables.id}`, variables),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', docVerId] })
	})
}

export const useDeleteNote = (docVerId: number) => {
	return useMutation({
		mutationFn: (id: number) => axiosInstance.delete(`/documents/${docVerId}/notes/${id}`),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes', docVerId] })
	})
}
