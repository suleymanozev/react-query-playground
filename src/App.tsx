import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type FormEvent, useState} from "react";

interface Post {
    id: number
    title: string
}

function App() {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const postsQuery = useQuery<Post[]>({
        queryKey: ['posts'],
        queryFn: async () => {
            const response = await fetch('http://localhost:3000/posts')
            return await response.json()
        }
    })

    const createPost = useMutation({
        mutationFn: async (post: Post) => {
            const response = await fetch('http://localhost:3000/posts', {body: JSON.stringify(post), method: 'POST'})
            return await response.json()
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({queryKey: ['posts']}).catch(console.error)
        },
    })

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        createPost.mutate({
            id: (postsQuery.data?.sort((a, b) => b.id - a.id)[0].id || 0) + 1,
            title: title
        })
    }

    if (postsQuery.isPending) return 'Loading...'

    if (postsQuery.error) return 'An error has occurred: ' + postsQuery.error.message


    return (
        <>

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
                </thead>
                <tbody>
                {postsQuery.data?.map(post => (
                    <tr key={post.id}>
                        <td>{post.id}</td>
                        <td>{post.title}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <form onSubmit={onSubmit}>
                <input type="text" name="title" placeholder="Title" required value={title}
                       onChange={(e) => setTitle(e.target.value)}/>
                <button type="submit">Submit</button>
            </form>
        </>
    )
}

export default App
