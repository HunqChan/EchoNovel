package com.echonovel.service;

import com.echonovel.dto.request.AuthorRequest;
import com.echonovel.dto.response.AuthorResponse;
import com.echonovel.entity.Author;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.repository.AuthorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    /**
     * Get all authors
     */
    public List<AuthorResponse> getAllAuthors() {
        return authorRepository.findAll()
                .stream()
                .map(AuthorResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create a new author (Admin)
     */
    @Transactional
    public AuthorResponse createAuthor(AuthorRequest request) {
        Author author = Author.builder()
                .name(request.getName())
                .bio(request.getBio())
                .build();

        author = authorRepository.save(author);
        log.info("Author created: {}", author.getName());
        return AuthorResponse.fromEntity(author);
    }

    /**
     * Update an author (Admin)
     */
    @Transactional
    public AuthorResponse updateAuthor(Long id, AuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setName(request.getName());
        author.setBio(request.getBio());

        author = authorRepository.save(author);
        log.info("Author updated: ID {}", author.getId());
        return AuthorResponse.fromEntity(author);
    }

    /**
     * Delete an author (Admin)
     */
    @Transactional
    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
        }
        authorRepository.deleteById(id);
        log.info("Author deleted: ID {}", id);
    }
}
