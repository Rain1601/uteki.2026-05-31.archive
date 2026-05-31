import { useLocation } from 'react-router-dom';

/**
 * Returns true when the current URL has `?embed=1`.
 * Used to render demo pages stripped of the sidebar / lang toggle when
 * embedded inside the landing page's DemoPreview iframe.
 */
export function useEmbed(): boolean {
  const loc = useLocation();
  return new URLSearchParams(loc.search).get('embed') === '1';
}
