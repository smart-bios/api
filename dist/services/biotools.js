"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _child_process = require("child_process");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _os = _interopRequireDefault(require("os"));

var home = _os["default"].homedir();

var databasesRoot = _path["default"].join(home, 'databases');

var threads = 4;

function parseSummary(summary) {
  var data = _fs["default"].readFileSync(summary, 'utf8');

  var headers = ['status', 'module', 'library'];
  var sumary = tsv2JsonNoHead(data, headers);
  return sumary.splice(1);
}

function parseFastqData(fastqc_data) {
  var data = _fs["default"].readFileSync(fastqc_data, 'utf8');

  var lines = data.split('\n');
  var headers = ['measure', 'value'];
  var statistics = lines.slice(3, 10);
  return statistics.map(function (line) {
    var data = line.split('\t');
    return headers.reduce(function (obj, nextKey, index) {
      obj[nextKey] = data[index];
      return obj;
    }, {});
  });
}

function tsv2JsonNoHead(tsv, headers) {
  var lines = tsv.split('\n');
  return lines.map(function (line) {
    var data = line.split('\t');
    return headers.reduce(function (obj, nextKey, index) {
      obj[nextKey] = data[index];
      return obj;
    }, {});
  });
}

function tsv2Json(tsv) {
  var lines = tsv.split('\n');
  var headers = lines.shift().split('\t');
  return lines.map(function (line) {
    var data = line.split('\t');
    return headers.reduce(function (obj, nextKey, index) {
      obj[nextKey] = data[index];
      return obj;
    }, {});
  });
}

function getPaths(user, project_name) {
  var user_dir = _path["default"].join(__dirname, "../../storage/".concat(user));

  var project_dir = "".concat(user_dir, "/").concat(project_name);
  var paths = {
    user_dir: user_dir,
    project_dir: project_dir
  };
  return paths;
}

var _default = {
  /*
  |--------------------------------------------------------------------------
  | Blast
  |--------------------------------------------------------------------------
  */
  blast: function blast(input, cb) {
    var database = _path["default"].join(databasesRoot, input.database);

    console.log("Database: ".concat(database));
    var outfmt = "6 qseqid qlen sseqid slen stitle pident qcovs length mismatch gapopen evalue bitscore";
    var headers = ['qseqid', 'qlen', 'sseqid', 'slen', 'stitle', 'pident', 'qcovs', 'length', 'mismatch', 'gapopen', 'evalue', 'bitscore'];
    var result = '';
    var seq = (0, _child_process.spawn)('echo', ["".concat(input.query)]);
    var blastcmd = (0, _child_process.spawn)("".concat(input.type_blast), ['-db', "".concat(database), '-num_threads', 4, '-outfmt', "".concat(outfmt)]);
    seq.stdout.on('data', function (data) {
      blastcmd.stdin.write(data);
    });
    seq.stderr.on('data', function (data) {
      console.error("stderr seq: ".concat(data));
    });
    seq.on('close', function (code) {
      if (code !== 0) {
        console.log("echo process exited with code ".concat(code));
      }

      blastcmd.stdin.end();
    });
    blastcmd.stdout.on('data', function (data) {
      result += data.toString();
    });
    blastcmd.stderr.on('data', function (data) {
      console.error("blastcmd stderr: ".concat(data));
    });
    blastcmd.on('close', function (code) {
      console.log("blastcmd process exited with code ".concat(code));
      var result_obj = tsv2JsonNoHead(result, headers);
      return cb(null, result_obj);
    });
  },

  /*
  |--------------------------------------------------------------------------
  | in silico PCR
  |--------------------------------------------------------------------------
  */
  in_silico_pcr: function in_silico_pcr(input, cb) {
    var pcr = '';
    var amplicon = '';
    var cmd = (0, _child_process.spawn)('in_silico_PCR.pl', ['-s', "".concat(input.input), '-a', "".concat(input.forward), '-b', "".concat(input.reverse)]);
    cmd.stdout.on('data', function (data) {
      //console.log(data.toString())
      pcr += data.toString();
    });
    cmd.stderr.on('data', function (data) {
      //console.log(data.toString())
      amplicon += data.toString();
    });
    cmd.on('close', function (code) {
      console.log("insilico_pcr process exited with code ".concat(code));
      var result = tsv2Json(pcr);
      return cb(null, result, amplicon);
    });
  },

  /*
  |--------------------------------------------------------------------------
  | Fastqc
  |--------------------------------------------------------------------------
  */
  fastqc: function fastqc(input, cb) {
    var url = getPaths(input.user, input.name);

    var fq = _path["default"].join(__dirname, "../../".concat(input.fq));

    var output = _path["default"].join(url.user_dir, 'fastqc');

    var basemame = _path["default"].basename(input.fq, '.fastq.gz');

    var cmd_fastqc = (0, _child_process.spawn)('fastqc', ['-t', 2, '-o', output, '--extract', fq]);
    cmd_fastqc.stderr.on('data', function (data) {
      console.log(data.toString());
    });
    cmd_fastqc.on('close', function (code) {
      console.log("fastqc process exited with code ".concat(code));

      if (code == 0) {
        var basic = parseFastqData("".concat(output, "/").concat(basemame, "_fastqc/fastqc_data.txt"));
        var summary = parseSummary("".concat(output, "/").concat(basemame, "_fastqc/summary.txt"));
        return cb(null, {
          basic: basic,
          summary: summary
        });
      } else {
        return cb(err, null, null);
      }
    });
  }
};
exports["default"] = _default;
//# sourceMappingURL=biotools.js.map