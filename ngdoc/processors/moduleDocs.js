var _ = require('lodash');

/**
 * @dgProcessor moduleDocsProcessor
 * @description
 * Compute the various fields for modules
 */
module.exports = function moduleDocsProcessor(log, aliasMap, moduleMap, createDocMessage) {
  return {
    $runAfter: ['ids-computed'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      var parts;

      // Compute some extra fields for docs in the API area
      _.forEach(docs, function(doc) {

        if ( doc.docType === 'module' ) {

          moduleMap.set(doc.id, doc);

          // Create a place to store references to the module's components
          doc.components = [];

          // Compute the package name and filename for the module
          var match = /^ng(.*)/.exec(doc.name);
          if ( match ) {
            if ( !doc.packageName ) {
              var packageName = match[1].toLowerCase();
              if ( packageName ) { packageName = '-' + packageName; }
              doc.packageName = 'angular' + packageName;
            }
            doc.packageFile = doc.packageName + '.js';
          }
        }
      });


      // Attach each doc to its module
      _.forEach(docs, function(doc) {
        if ( doc.docType !== 'module' && doc.module ) {
          var matchingModules = aliasMap.getDocs(doc.module);

          if ( matchingModules.length > 1 ) {
            // try matching with the 'module:' specifier
            matchingModules = aliasMap.getDocs('module:' + doc.module);
          }

          if ( matchingModules.length === 1 ) {
            var module = matchingModules[0];
            module.components.push(doc);
            doc.moduleDoc = module;
          } else if ( matchingModules.length > 1 ) {
            console.log(matchingModules.length);
            _.forEach(matchingModules, function(mod) {
              console.log(mod.id);
            });
            throw new Error(createDocMessage('Ambiguous module reference: "' + doc.module + '"', doc));
          }
        }
      });

    }
  };
};