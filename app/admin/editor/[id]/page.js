import { notFound } from 'next/navigation';import PageEditor from '../../../../components/PageEditor';import { getCategory } from '../../../../lib/categories';import { getDb } from '../../../../lib/db';import { defaultBlocks, safeJson } from '../../../../lib/content';
export const dynamic='force-dynamic';
export default async function Editor({params,searchParams}){
  const db=getDb();let page=null;let category=searchParams?.category||'pro';let starterBlocks=defaultBlocks(category);let initialMeta={};
  if(params.id!=='new'){
    const [rows]=await db.query('SELECT * FROM pages WHERE id=? LIMIT 1',[params.id]);page=rows[0];if(!page)return notFound();category=page.category_key;page.blocks=safeJson(page.blocks_json,[]);
    const [metaRows]=await db.query('SELECT seo_title,seo_description,og_image,favicon_url,canonical_url,head_code,body_end_code FROM page_meta WHERE page_id=? LIMIT 1',[params.id]);initialMeta=metaRows[0]||{};
  }else{const [rows]=await db.query('SELECT blocks_json FROM templates WHERE category_key=? LIMIT 1',[category]);if(rows[0])starterBlocks=safeJson(rows[0].blocks_json,starterBlocks)}
  if(!getCategory(category))return notFound();return <PageEditor page={page} category={category} starterBlocks={starterBlocks} initialMeta={initialMeta}/>;
}
