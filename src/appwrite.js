// src/appwrite.js
import { Client, Databases, ID, Query } from "appwrite";

// ---- Read env vars (Vite requires VITE_ prefix) ----
const PROJECT_ID    = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID   = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT      = import.meta.env.VITE_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1";

// ---- Create client / databases ----
const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const database = new Databases(client);

// Helper: are we configured?
function missingConfig() {
    const missing = [];
    if (!PROJECT_ID) missing.push("VITE_APPWRITE_PROJECT_ID");
    if (!DATABASE_ID) missing.push("VITE_APPWRITE_DATABASE_ID");
    if (!COLLECTION_ID) missing.push("VITE_APPWRITE_COLLECTION_ID");
    if (missing.length) {
        console.error("Appwrite config missing in environment:", missing.join(", "));
        return true;
    }
    return false;
}

// Update or create a search counter doc
export const updateSearchCount = async (searchTerm, movie) => {
    if (missingConfig()) return; // don’t crash UI in prod if misconfigured

    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal("searchTerm", searchTerm)]
        );

        const docs = Array.isArray(result?.documents) ? result.documents : [];

        if (docs.length > 0) {
            const doc = docs[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: (doc.count ?? 0) + 1,
                // keep other fields if you want
            });
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie?.id ?? null,
                poster_url: movie?.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null,
            });
        }
    } catch (error) {
        console.error("updateSearchCount failed:", error);
        // swallow so UI doesn't go dark
    }
};

// Get top trending from your collection
export const getTrendingMovies = async () => {
    if (missingConfig()) return []; // safe fallback

    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.limit(5), Query.orderDesc("count")]
        );
        return Array.isArray(result?.documents) ? result.documents : [];
    } catch (error) {
        console.error("getTrendingMovies failed:", error);
        return []; // safe fallback so UI renders
    }
};


// import {Client, Databases, ID, Query } from 'appwrite'
//
// const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
// const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
// const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
//
// const client = new Client()
//     .setEndpoint('https://cloud.appwrite.io/v1')
//     .setProject(PROJECT_ID)
//
// const database = new Databases(client);
//
// export const updateSearchCount = async (searchTerm, movie) => {
// //1. Use Appwrite SDK to check if the search term exists in the database
//     try {
//         const result = await database.listDocuments(
//             DATABASE_ID,
//             COLLECTION_ID,
//             [Query.equal('searchTerm', searchTerm)]
//         );
//
//
//         if(result.documents.length > 0) {
//         const doc = result.documents[0];
//
//         await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
//             count: doc.count + 1,
//         })
//     } else {
//         await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
//             searchTerm,
//             count: 1,
//             movie_id: movie.id,
//             poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
//         })
//
//     }
//     } catch (error) {
//         console.log(error);
//     }
//     //2. If it does, update the count
//     //3. If it doesn't, create a new document with the search term and count as a 1
// }
//
// export const getTrendingMovies = async () => {
//     try {
//         const result = await database.listDocuments(
//             DATABASE_ID,
//             COLLECTION_ID,
//             [Query.limit(5),
//             Query.orderDesc("count")]
//         );
//
//         return result.documents;
//
//     } catch (error) {
//         console.error(error);
//     }
//
// }
