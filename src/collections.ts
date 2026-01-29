import { Collection, Directory } from 'renoun';
import { z } from 'zod';

const testSchema1 = z.object({
  frontmatter: z.object({
    title: z.string(),
    summary: z.string().optional(),
    hideToc: z.boolean().default(false),
  }),
});

const testSchema2 = z.object({
  frontmatter: z.object({
    title: z.string(),
    summary: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const TestDirectory1 = new Directory({
  basePathname: 'test-1',
  schema: {
    mdx: testSchema1,
  },
  loader: {
    mdx: (path) => import(`./${path}.mdx`),
  },
});

const TestDirectory2 = new Directory({
  basePathname: 'test-2',
  schema: {
    mdx: testSchema2,
  },
  loader: {
    mdx: (path) => import(`./${path}.mdx`),
  },
});

const TestDirectory3 = new Directory({
  basePathname: 'test-3',
});

// Note: the `Directory.getExportValue` doesn't show the autocomplete values
// like `default` and `frontmatter` as we have in the `Collection.getExportValue`

/*
// Result: OK
const frontmatter1: {
    title: string;
    hideToc: boolean;
    summary?: string | undefined;
}
*/
const frontmatter1 = await (
  await TestDirectory1.getFile('test', 'mdx')
).getExportValue('frontmatter');
/*
// Result: OK
const frontmatter2: {
    title: string;
    tags: string[];
    summary?: string | undefined;
}
*/
const frontmatter2 = await (
  await TestDirectory2.getFile('test', 'mdx')
).getExportValue('frontmatter');
/*
// Result: OK - using the default `Frontmatter` type
const frontmatter3: Frontmatter | undefined
*/
const frontmatter3 = await (
  await TestDirectory3.getFile('test', 'mdx')
).getExportValue('frontmatter');

/*
const testCollection: Collection<InferModuleLoadersTypes<{
    mdx: ModuleRuntimeLoader<{
        default: MDXContent;
        frontmatter?: Frontmatter;
    }>;
    md: ModuleRuntimeLoader<{
        default: MDXContent;
        frontmatter?: Frontmatter;
    }>;
    json: ModuleRuntimeLoader<...>;
}>, [...], {
    mdx: ModuleRuntimeLoader<{
        default: MDXContent;
        frontmatter?: Frontmatter;
    }>;
    md: ModuleRuntimeLoader<{
        default: MDXContent;
        frontmatter?: Frontmatter;
    }>;
    json: ModuleRuntimeLoader<...>;
}>
*/
const testCollection = new Collection({
  entries: [TestDirectory1, TestDirectory2],
});

/*
// Result: NOK 
// Here I would expect the frontmatter definitions/types from `TestDirectory1` and `TestDirectory2`
// but if we check the `testCollection` type, 
// it seems the wrong type is already used/returned while initializing the `Collection`
// Also is the `Record<string, unknown>` the expected type for `getFrontmatter`?

const collectionFrontmatter: Frontmatter | undefined
const collectionFrontmatterAlt1: MDXModuleExport<Frontmatter | undefined>
const collectionFrontmatterAlt2: Record<string, unknown> | undefined

*/
const collectionFrontmatter = await (
  await testCollection.getFile('test', 'mdx')
).getExportValue('frontmatter');

const collectionFrontmatterAlt1 = await (
  await testCollection.getFile('test', 'mdx')
).getExport('frontmatter');

const collectionFrontmatterAlt2 = await (
  await testCollection.getFile('test', 'mdx')
).getFrontmatter()
