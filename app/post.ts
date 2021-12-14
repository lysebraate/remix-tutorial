import path from "path";
import fs from "fs/promises";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
};

export type PostMarkdownAttributes = {
    title: string;
};

function isValidPostAttributes(attributes: any): attributes is PostMarkdownAttributes {
    return attributes?.title;
}

const postsPath = path.join(__dirname, "..", "posts");

export async function getPosts() {
  const dir = await fs.readdir(postsPath);
  return Promise.all(
    dir.map(async filename => {
      const file = await fs.readFile(
        path.join(postsPath, filename)
      );
      const { attributes } = parseFrontMatter(
        file.toString()
      );
      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad meta data!`
      );      
      return {
        slug: filename.replace(/\.md$/, ""),
        title: attributes.title
      };
    })
  );
};

export type MarkdownPost = {
    title: string;
    slug: string;
    html: string;    
}

export async function getPost(slug: string): Promise<MarkdownPost> {
    const filepath = path.join(postsPath, slug + ".md");
    const file = await fs.readFile(filepath);
    const { attributes, body } = parseFrontMatter(file.toString());
    invariant(
      isValidPostAttributes(attributes),
      `Post ${filepath} is missing attributes`
    );
    const html = marked(body);
    return { slug, html, title: attributes.title };
};

export async function getMarkdownPost(slug: string): Promise<NewPost> {
    const filepath = path.join(postsPath, slug + ".md");
    const file = await fs.readFile(filepath);
    const { attributes, body } = parseFrontMatter(file.toString());
    invariant(
      isValidPostAttributes(attributes),
      `Post ${filepath} is missing attributes`
    );
    return { slug, markdown: body, title: attributes.title };
};

export type NewPost = {
    title: string;
    slug: string;
    markdown: string;
  };

export async function createPost(post: NewPost) {
    const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
    await fs.writeFile(
      path.join(postsPath, post.slug + ".md"),
      md
    );
    return getPost(post.slug);
  }
  
  export type PostError = {
    title?: boolean;
    slug?: boolean;
    markdown?: boolean;
  };