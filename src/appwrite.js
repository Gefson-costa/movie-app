import { Client, Databases, ID, Query, Permission, Role } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;


const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    // 1. Use Appwrite SDK to check if the search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])

        // 2. If it does, update the count;
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
            
            return { success: true, action: 'updated' };
        // 3. If it doesn't, create a new document with the search term and count as 1;
        } else {
            await database.createDocument(
                DATABASE_ID, 
                COLLECTION_ID, 
                ID.unique(), 
                {
                    searchTerm,
                    count: 1,
                    movie_id: movie.id,
                    poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                },
                [
                    Permission.read(Role.any()), // Permite leitura pública
                    Permission.write(Role.any()) // Permite escrita pública (necessário para updates futuros)
                ]
            )
            
            return { success: true, action: 'created' };
        }

    } catch (error) {
        console.error('Erro ao atualizar contagem de busca:', error);
        return { success: false, error: error.message || 'Erro desconhecido ao atualizar contagem' };
    }
    
    

}


export const getTrendingMovies = async() => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ])

        return result.documents || [];

    } catch(error) {
        console.error('Erro ao buscar filmes em destaque:', error);
        return []; // Retorna array vazio em caso de erro para não quebrar a UI
    }
}