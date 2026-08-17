package com.echonovel.service.impl;

import com.echonovel.dto.request.AuthorRequest;
import com.echonovel.dto.response.AuthorResponse;
import com.echonovel.entity.Author;
import com.echonovel.exception.AppException;
import com.echonovel.exception.ErrorCode;
import com.echonovel.mapper.AuthorMapper;
import com.echonovel.repository.AuthorRepository;
import com.echonovel.service.AuthorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    /**
     * Get all authors
     */
    @Override
    public List<AuthorResponse> getAllAuthors() {
        return authorRepository.findAll()
                .stream()
                .map(authorMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new author (Admin)
     */
    @Override
    @Transactional
    public AuthorResponse createAuthor(AuthorRequest request) {
        Author author = authorMapper.toEntity(request);
        author = authorRepository.save(author);
        log.info("Author created: {}", author.getName());
        return authorMapper.toResponse(author);
    }

    /**
     * Update an author (Admin)
     */
    @Override
    @Transactional
    public AuthorResponse updateAuthor(Long id, AuthorRequest request) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setName(request.getName());
        author.setBio(request.getBio());

        author = authorRepository.save(author);
        log.info("Author updated: ID {}", author.getId());
        return authorMapper.toResponse(author);
    }

    /**
     * Delete an author (Admin)
     */
    @Override
    @Transactional
    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new AppException(ErrorCode.AUTHOR_NOT_FOUND);
        }
        authorRepository.deleteById(id);
        log.info("Author deleted: ID {}", id);
    }
}
