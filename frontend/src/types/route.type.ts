export type RouteType = {
   route: string | undefined,
   title?: string | undefined,
   template?: string | undefined,
   useLayout?: string | boolean,
   load: () => void;
}