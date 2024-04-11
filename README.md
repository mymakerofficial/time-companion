# Time Companion

A time tracking app.

> [!CAUTION]
> This project is currently in early development and should not be used for daily time tracking.
> Data may be lost at any point!

## Project Setup

```sh
npm install
```

### **Start Development Application and Webserver with Hot-Reload**

```sh
npm run start
```
> The application will automatically startup and the standalone webpage can be accessed at [http://localhost:5173](http://localhost:5173/).
> You can run the webserver standalone (without Electron) using `npm run dev`

### Build for Production

```sh
# web
npm run build

# electron
npm run make
```

## Testing
We use Vitest for testing.

### **Run Tests and Rerun on Changes**
```sh
npm run test
```
> Vitest results can be viewed in the browser at [http://localhost:51204/\_\_vitest\_\_/](http://localhost:51204/__vitest__/).
> We recommend letting the tests run while you work ;)

### Run Tests, Check Formatting and Type-Check
```sh
npm run check

# only check formatting
npm run check-format

# only check types
npm run type-check
```
> Please run `npm run check` before commiting to make sure your changes can be build.

### Format all files using prettier
```sh
npm run format
```
