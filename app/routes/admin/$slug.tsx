import { useActionData, useLoaderData, redirect, Form, useTransition } from "remix";
import type { LoaderFunction, ActionFunction } from "remix";
import { getMarkdownPost, NewPost, PostError, createPost } from "~/post";
import invariant from "tiny-invariant";

export const loader: LoaderFunction = async ({
    params
  }) => {
    console.log('Params in loader before invariant', params);
    invariant(params.slug, "expected params.slug");
    console.log('Params in loader', params);
    const post = await getMarkdownPost(params.slug);
    console.log('Post in loader', post);
    return post;
  };

  export const action: ActionFunction = async ({ request }) => {
    await new Promise(res => setTimeout(res, 1000));

    const formData = await request.formData();
  
    const title = formData.get("title");
    const slug = formData.get("slug");
    const markdown = formData.get("markdown");
  
    const errors: PostError = {};
    if (!title) errors.title = true;
    if (!slug) errors.slug = true;
    if (!markdown) errors.markdown = true;
  
    if (Object.values(errors).length) {
      return errors;
    }

    invariant(typeof title === "string");
    invariant(typeof slug === "string");
    invariant(typeof markdown === "string");
    await createPost({ title, slug, markdown });
  
    return redirect("/admin");
  };


  export default function EditPostSlug() {

    const post = useLoaderData<NewPost>();
    const errors = useActionData();
    const transition = useTransition();

    console.log("Rerender?");
    console.log(post);

    return (
      <Form method="post">
      <p>
        <label>
        Post Title:{" "}
        {errors?.title && <em>Title is required</em>}
        <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
        Post Slug:{" "}
          {errors?.slug && <em>Slug is required</em>}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{" "}
        {errors?.markdown && <em>Markdown is required</em>}
        <br />
        <textarea id="markdown" rows={20} name="markdown" defaultValue={post.markdown} />
      </p>
      <p>
        <button type="submit">
        {transition.submission
            ? "Creating..."
            : "Create Post"}
        </button>
      </p>
    </Form>
    );
  }
