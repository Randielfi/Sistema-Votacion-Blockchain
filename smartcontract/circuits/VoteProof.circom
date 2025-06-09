pragma circom 2.0.0;

include "./circomlib/poseidon.circom";
include "./circomlib/merkleProof.circom";
include "./circomlib/lessThan.circom";

template VoteProof(levels) {
    // === Inputs privados ===
    signal input identitySecret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // === Inputs públicos ===
    signal input root;
    signal input nullifierHash;
    signal input electionId;
    signal input candidateIndex;

    // === Señales internas ===
    signal identityCommitment;
    component hasher = Poseidon(1);

    // 1️⃣ Calcular identityCommitment = Hash(identitySecret)
    hasher.inputs[0] <== identitySecret;
    identityCommitment <== hasher.out;

    // 2️⃣ Verificar que identityCommitment pertenece al Merkle root
    component merkleProof = MerkleProof(levels);
    merkleProof.leaf <== identityCommitment;

    for (var i = 0; i < levels; i++) {
        merkleProof.pathElements[i] <== pathElements[i];
        merkleProof.pathIndices[i] <== pathIndices[i];
    }

    merkleProof.calculatedRoot === root;

    // 3️⃣ Calcular nullifierHash = Hash(identitySecret, electionId)
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== identitySecret;
    nullifierHasher.inputs[1] <== electionId;
    nullifierHasher.out === nullifierHash;

    // 4️⃣ Verificar que candidateIndex está en rango [0..9]
    component lt = LessThan(32);
    lt.in[0] <== candidateIndex;
    lt.in[1] <== 10;
    lt.out === 1;
}

component main = VoteProof(20); // Árbol Merkle de 2^20 hojas (~1 millón de votantes)
