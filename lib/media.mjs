export function safeUrl(value){if(typeof value!=='string')return '';try{const u=new URL(value.replaceAll('&amp;','&'));return u.protocol==='https:'?u.href:'';}catch{return '';}}
export function extractPost(p){
 const original=p.crosspost_parent_list?.[0]||p;
 const rv=original.secure_media?.reddit_video||original.media?.reddit_video||original.preview?.reddit_video_preview;
 const direct=safeUrl(original.url_overridden_by_dest||original.url);
 const native=rv?.hls_url||rv?.fallback_url;
 const directVideo=/\.(mp4|webm)(\?|$)/i.test(direct);
 const external=!!(original.is_video||original.secure_media?.oembed?.type==='video'||original.media?.oembed?.type==='video');
 if(!native&&!directVideo&&!external)return null;
 return {id:p.name,title:p.title,subreddit:p.subreddit,author:p.author,score:p.score,comments:p.num_comments,created:p.created_utc,nsfw:!!p.over_18,spoiler:!!p.spoiler,url:safeUrl('https://www.reddit.com'+p.permalink),src:safeUrl(rv?.fallback_url)||(directVideo?direct:''),hls:safeUrl(rv?.hls_url),poster:safeUrl(original.preview?.images?.[0]?.source?.url)||safeUrl(original.thumbnail),external:!native&&!directVideo};
}
export function orderedVideos(children){return children.map(c=>extractPost(c.data)).filter(Boolean);}
