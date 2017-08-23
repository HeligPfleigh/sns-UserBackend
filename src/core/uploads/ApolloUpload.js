import mkdirp from 'mkdirp';
import formidable from 'formidable';
import objectPath from 'object-path';
import path from 'path';

export function processRequest(request, { uploadDir } = {}) {
  // Ensure provided upload directory exists
  if (uploadDir) mkdirp.sync(uploadDir);

  const form = formidable.IncomingForm({
    // Defaults to the OS temp directory
    uploadDir,
    keepExtensions: true,
    maxFieldsSize: 100 * 1024 * 1024,
  });

  // Parse the multipart form request
  return new Promise((resolve, reject) => {
    form.parse(request, (error, { operations }, files) => {
      if (error) reject(new Error(error));

      // Decode the GraphQL operation(s). This is an array if batching is
      // enabled.
      operations = JSON.parse(operations);
      // Check if files were uploaded
      if (Object.keys(files).length) {
        // File field names contain the original path to the File object in the
        // GraphQL operation input variables. Relevent data for each uploaded
        // file now gets placed back in the variables.
        const operationsPath = objectPath(operations);
        Object.keys(files).forEach((variablesPath) => {
          const { name, type, size, path: filePath } = files[variablesPath];
          operationsPath.set(variablesPath, {
            name,
            type,
            size,
            url: `${request.secure ? 'https' : 'http'}://${request.headers.host}/public/uploads/${path.basename(filePath)}`,
          });
        });
      }

      // Provide fields for replacement request body
      resolve(operations);
    });
  });
}

export function apolloUploadKoa(options) {
  return async (ctx, next) => {
    // Skip if there are no uploads
    if (ctx.request.is('multipart/form-data')) {
      ctx.request.body = await processRequest(ctx.req, options);
    }
    await next();
  };
}

export function apolloUploadExpress(options) {
  return async (request, response, next) => {
    // Skip if there are no uploads
    if (!request.is('multipart/form-data')) {
      await next();
    } else {
      await processRequest(request, options).then(async (body) => {
        request.body = body;
        await next();
      });
    }
  };
}
