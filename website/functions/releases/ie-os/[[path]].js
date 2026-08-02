export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/releases\/ie-os\//, '').replace(/^\//, '');

  if (!path) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain' } });
  }

  const objectKey = `releases/ie-os/${path}`;
  const object = await env.IE_OS_RELEASES.get(objectKey);

  if (!object) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain' } });
  }

  const headers = new Headers();
  headers.set('content-type', object.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('content-length', String(object.size));

  return new Response(object.body, { headers });
}
