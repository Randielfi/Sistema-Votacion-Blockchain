pragma circom 2.0.0;
template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output calculatedRoot;

    // Para ejemplo, simplemente dejamos:
    calculatedRoot <== 0; // Dummy, en real se calcula Merkle root
}
