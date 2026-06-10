# @node-i3x/app

## 0.2.0

### Minor Changes

- feat: publishable CLI, turbo builds, and demo-embedded

  - @node-i3x/app: evolved into publishable CLI with commander,
    cosmiconfig, layered config (defaults → yml → env → args)
  - @node-i3x/demo-embedded: publishable with i3x-demo and
    i3x-demo-client bin entries, CLI args for ports
  - All library packages now export from dist/ (no tsx required)
  - Added turbo for dependency-ordered cached builds
  - Added VHS recording scripts for demo GIF

### Patch Changes

- Updated dependencies
  - @node-i3x/core@0.2.0
  - @node-i3x/opcua-connector@0.2.0
  - @node-i3x/rest-server@0.2.0
