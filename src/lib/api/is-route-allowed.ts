export function isRouteAllowed(currentRoute: string, allowedRoutes: string[]): boolean {
  return allowedRoutes.some((route) => {
    if (!route.includes('[') && !route.includes(']')) {
      return currentRoute === route;
    }

    const dynamicSegments = route.split('/').map((segment) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return '([^/]+)';
      }
      return segment;
    });

    const routePattern = new RegExp('^' + dynamicSegments.join('/') + '$');
    return routePattern.test(currentRoute);
  });
}
