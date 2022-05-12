
import escomp from 'escomplex';
import fs from 'fs';
import {listFilesRecursively} from './utils';

/**
 * Generate a complexity report for a directory.
 *
 * @param {string} path Path to the repository.
 * @return {Record<string,unknown>} a complexity report.
 */
export function computeRepoComplexity(path:string):Record<string, unknown> {
  const filePaths = listFilesRecursively(path);
  const files = filePaths.map((fPath) =>{
    return {
      path: fPath,
      code: fs.readFileSync(fPath).toString(),
    };
  });
  const complexities = escomp.analyse(files);
  let totalCyclomatic = 0;
  let totalHalsteadLength = 0;
  let totalHalsteadEffort = 0;
  let totalLogicalLines = 0;
  let totalNFunctions = 0;
  complexities.reports.forEach((report) => {
    totalCyclomatic += report.aggregate.cyclomatic;
    totalHalsteadLength += report.aggregate.halstead.operands.total;
    totalHalsteadLength += report.aggregate.halstead.operators.total;
    totalHalsteadEffort += report.aggregate.halstead.effort;
    totalLogicalLines += report.aggregate.sloc.logical;
    totalNFunctions += report.functions.length;
  });
  complexities['totalCyclomatic'] = totalCyclomatic;
  complexities['totalHalsteadLength'] = totalHalsteadLength;
  complexities['totalHalsteadEffort'] = totalHalsteadEffort;
  complexities['totalLogicalLines'] = totalLogicalLines;
  complexities['totalNFunctions'] = totalNFunctions;
  return complexities;
}
