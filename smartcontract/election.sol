// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    address public owner;
    uint public currentElectionId = 0;

    struct Candidate {
        string name;
        uint voteCount;
    }

    struct ElectionData {
        string title;
        bool started;
        bool ended;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
    }

    mapping(uint => ElectionData) private elections;

    event ElectionStarted(uint electionId, string title);
    event ElectionEnded(uint electionId);
    event VoteCasted(uint electionId, uint candidateIndex, string candidateName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede hacer esto");
        _;
    }

    modifier electionExists(uint electionId) {
        require(electionId <= currentElectionId, "Eleccion no existe");
        _;
    }

    modifier electionActive(uint electionId) {
        require(elections[electionId].started && !elections[electionId].ended, "Eleccion no activa");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Inicia una nueva elección con un título y una lista de candidatos
    function startNewElection(string memory title, string[] memory candidateNames) public onlyOwner {
        require(candidateNames.length > 0, "Debe haber al menos un candidato");
        currentElectionId++;
        ElectionData storage newElection = elections[currentElectionId];
        newElection.title = title;
        for (uint i = 0; i < candidateNames.length; i++) {
            newElection.candidates.push(Candidate(candidateNames[i], 0));
        }
        newElection.started = true;
        emit ElectionStarted(currentElectionId, title);
    }

    /// @notice Permite a un votante votar por un candidato en una elección específica
    function vote(uint electionId, uint candidateIndex) public electionExists(electionId) electionActive(electionId) {
        ElectionData storage e = elections[electionId];
        require(!e.hasVoted[msg.sender], "Ya has votado en esta eleccion");
        require(candidateIndex < e.candidates.length, "Indice de candidato invalido");

        e.candidates[candidateIndex].voteCount++;
        e.hasVoted[msg.sender] = true;

        emit VoteCasted(electionId, candidateIndex, e.candidates[candidateIndex].name);
    }

    /// @notice Solo para pruebas: permite al owner votar por cualquier wallet
    function voteFor(uint electionId, uint candidateIndex, address voter) public onlyOwner electionExists(electionId) electionActive(electionId) {
        ElectionData storage e = elections[electionId];
        require(!e.hasVoted[voter], "Esta direccion ya ha votado en esta eleccion");
        require(candidateIndex < e.candidates.length, "Indice de candidato invalido");

        e.candidates[candidateIndex].voteCount++;
        e.hasVoted[voter] = true;

        emit VoteCasted(electionId, candidateIndex, e.candidates[candidateIndex].name);
    }

    /// @notice Finaliza una elección específica
    function endElection(uint electionId) public onlyOwner electionExists(electionId) {
        ElectionData storage e = elections[electionId];
        e.ended = true;
        e.started = false;
        emit ElectionEnded(electionId);
    }

    /// @notice Devuelve los nombres y votos de todos los candidatos en una elección
    function getResults(uint electionId) public view electionExists(electionId) returns (string[] memory names, uint[] memory votes) {
        ElectionData storage e = elections[electionId];
        names = new string[](e.candidates.length);
        votes = new uint[](e.candidates.length);

        for (uint i = 0; i < e.candidates.length; i++) {
            names[i] = e.candidates[i].name;
            votes[i] = e.candidates[i].voteCount;
        }
    }

    /// @notice Devuelve la cantidad de candidatos en una elección
    function getCandidatesCount(uint electionId) public view electionExists(electionId) returns (uint) {
        return elections[electionId].candidates.length;
    }

    /// @notice Devuelve los detalles de un candidato específico en una elección
    function getCandidate(uint electionId, uint index) public view electionExists(electionId) returns (string memory name, uint voteCount) {
        Candidate storage c = elections[electionId].candidates[index];
        return (c.name, c.voteCount);
    }

    /// @notice Verifica si una dirección ya ha votado en una elección
    function hasAddressVoted(uint electionId, address voter) public view electionExists(electionId) returns (bool) {
        return elections[electionId].hasVoted[voter];
    }

    /// @notice Devuelve el estado de una elección incluyendo título y número de candidatos
    function getElectionStatus(uint electionId) public view electionExists(electionId) returns (string memory title, bool started, bool ended, uint candidatesCount) {
        ElectionData storage e = elections[electionId];
        return (e.title, e.started, e.ended, e.candidates.length);
    }

    /// @notice Devuelve el ganador de una elección
    function getWinner(uint electionId) public view electionExists(electionId) returns (string memory winnerName, uint winnerVotes, bool isTie) {
        ElectionData storage e = elections[electionId];
        require(e.candidates.length > 0, "No hay candidatos");

        uint highestVoteCount = 0;
        uint winnersCount = 0;
        uint winnerIndex = 0;

        for (uint i = 0; i < e.candidates.length; i++) {
            if (e.candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = e.candidates[i].voteCount;
                winnerIndex = i;
                winnersCount = 1;
            } else if (e.candidates[i].voteCount == highestVoteCount) {
                winnersCount++;
            }
        }

        isTie = winnersCount > 1;
        winnerName = e.candidates[winnerIndex].name;
        winnerVotes = highestVoteCount;
    }
} 
